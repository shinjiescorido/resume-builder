import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { BrowserProvider } from './browser.provider';
import { CreateJobDto, JobRecord, JobStatus, ResumePayloadDto } from './job.types';
import { getTemplate } from './templates';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly jobs = new Map<string, JobRecord>();
  private readonly pdfDir = process.env.PDF_DIR ?? '/data/pdfs';

  constructor(private readonly browser: BrowserProvider) {}

  acceptJob(dto: CreateJobDto) {
    const record: JobRecord = { jobId: dto.jobId, status: 'pending', path: null, error: null };
    this.jobs.set(dto.jobId, record);
    queueMicrotask(() => {
      this.process(dto).catch((err) => {
        this.logger.error(`Job ${dto.jobId} failed in dispatch`, err);
      });
    });
    return { jobId: dto.jobId, status: 'pending' as JobStatus };
  }

  async getFilePath(jobId: string): Promise<string> {
    const candidate = join(this.pdfDir, `${jobId}.pdf`);
    try {
      const s = await stat(candidate);
      if (s.isFile()) return candidate;
    } catch {
      /* fall through */
    }
    throw new NotFoundException('PDF not found');
  }

  private async process(dto: CreateJobDto): Promise<void> {
    try {
      await mkdir(this.pdfDir, { recursive: true });
      const buffer = await this.renderToPdf(dto.resume, dto.template);
      const path = join(this.pdfDir, `${dto.jobId}.pdf`);
      const { writeFile } = await import('fs/promises');
      await writeFile(path, buffer);
      const rec = this.jobs.get(dto.jobId);
      if (rec) {
        rec.status = 'ready';
        rec.path = path;
      }
      await this.callback(dto, 'ready');
    } catch (err) {
      const message = (err as Error).message ?? 'Unknown error';
      this.logger.error(`Job ${dto.jobId} failed: ${message}`);
      const rec = this.jobs.get(dto.jobId);
      if (rec) {
        rec.status = 'failed';
        rec.error = message;
      }
      await this.callback(dto, 'failed', message);
    }
  }

  private async renderToPdf(resume: ResumePayloadDto, template?: string): Promise<Buffer> {
    const renderer = getTemplate(template);
    const html = renderer(resume);
    const browser = await this.browser.get();
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const result = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      return Buffer.isBuffer(result) ? result : Buffer.from(result);
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  private async callback(dto: CreateJobDto, status: 'ready' | 'failed', error?: string) {
    try {
      await fetch(dto.callbackUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-webhook-secret': dto.secret,
        },
        body: JSON.stringify({ jobId: dto.jobId, status, error }),
      });
    } catch (err) {
      this.logger.error(`Callback to ${dto.callbackUrl} failed: ${(err as Error).message}`);
    }
  }
}
