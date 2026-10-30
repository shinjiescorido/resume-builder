import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ResumesService } from '../resumes/resumes.service';

interface SectionItemPayload {
  details: string;
  date: string;
  notes: string[];
}

interface ReferenceItemPayload {
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
}

interface PdfJobPayload {
  jobId: string;
  callbackUrl: string;
  secret: string;
  template: string;
  resume: {
    title: string;
    summary: string;
    biography: { name: string; address: string; height: string; weight: string };
    contacts: { email: string; phone: string; website: string; linkedin: string };
    workExperience: SectionItemPayload[];
    education: SectionItemPayload[];
    skills: SectionItemPayload[];
    achievements: SectionItemPayload[];
    languages: SectionItemPayload[];
    hobbies: SectionItemPayload[];
    references: ReferenceItemPayload[];
    photo?: { dataUrl: string };
  };
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly resumes: ResumesService) {}

  async requestGeneration(userId: string, resumeId: string) {
    const resume = await this.resumes.findOwned(userId, resumeId);
    const photoDataUrl = await this.loadPhotoAsDataUrl(resume.photoPath);

    const stripIds = (items: Array<{ details: string; date: string; notes: string[] }>) =>
      items.map((i) => ({ details: i.details, date: i.date, notes: i.notes }));

    const jobId = randomUUID();
    const payload: PdfJobPayload = {
      jobId,
      callbackUrl: `${process.env.PUBLIC_BACKEND_URL ?? 'http://backend:4000'}/internal/pdf-webhook`,
      secret: process.env.PDF_WEBHOOK_SECRET ?? '',
      template: resume.template ?? 'classic',
      resume: {
        title: resume.title,
        summary: resume.summary ?? '',
        biography: {
          name: resume.biography?.name ?? '',
          address: resume.biography?.address ?? '',
          height: resume.biography?.height ?? '',
          weight: resume.biography?.weight ?? '',
        },
        contacts: {
          email: resume.contacts?.email ?? '',
          phone: resume.contacts?.phone ?? '',
          website: resume.contacts?.website ?? '',
          linkedin: resume.contacts?.linkedin ?? '',
        },
        workExperience: stripIds(resume.workExperience ?? []),
        education:      stripIds(resume.education ?? []),
        skills:         stripIds(resume.skills ?? []),
        achievements:   stripIds(resume.achievements ?? []),
        languages:      stripIds(resume.languages ?? []),
        hobbies:        stripIds(resume.hobbies ?? []),
        references: (resume.references ?? []).map((r) => ({
          name: r.name ?? '',
          phone: r.phone ?? '',
          email: r.email ?? '',
          company: r.company ?? '',
          position: r.position ?? '',
        })),
        ...(photoDataUrl ? { photo: { dataUrl: photoDataUrl } } : {}),
      },
    };

    await this.resumes.setPdfPending(userId, resumeId, jobId);

    const url = `${process.env.PDF_SERVICE_URL ?? 'http://pdf-generator:4001'}/jobs`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      this.logger.error(`PDF service unreachable: ${(err as Error).message}`);
      await this.resumes.setPdfStatusByJobId(jobId, 'failed', 'PDF service unreachable');
      throw new InternalServerErrorException('PDF service unreachable');
    }
    if (res.status !== 202) {
      const text = await res.text().catch(() => '');
      this.logger.error(`PDF service rejected job: ${res.status} ${text}`);
      await this.resumes.setPdfStatusByJobId(jobId, 'failed', `PDF service ${res.status}`);
      throw new InternalServerErrorException('PDF service rejected job');
    }

    return { jobId, pdfStatus: 'pending' as const };
  }

  async streamPdf(userId: string, resumeId: string): Promise<ReadableStream<Uint8Array>> {
    const resume = await this.resumes.findOwned(userId, resumeId);
    if (resume.pdfStatus !== 'ready' || !resume.pdfJobId) {
      throw new BadRequestException('PDF is not ready');
    }
    const url = `${process.env.PDF_SERVICE_URL ?? 'http://pdf-generator:4001'}/files/${resume.pdfJobId}`;
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      throw new InternalServerErrorException('Could not fetch PDF from generator');
    }
    return res.body;
  }

  async handleWebhook(jobId: string, status: 'ready' | 'failed', error?: string) {
    await this.resumes.setPdfStatusByJobId(jobId, status, error);
  }

  private async loadPhotoAsDataUrl(photoPath: string | null): Promise<string | null> {
    if (!photoPath) return null;
    const root = process.env.UPLOAD_DIR ?? join(process.cwd(), 'data', 'uploads');
    const rel = photoPath.replace(/^\/uploads\//, '');
    const abs = join(root, rel);
    try {
      const buf = await readFile(abs);
      const ext = abs.split('.').pop()?.toLowerCase();
      const mime =
        ext === 'png' ? 'image/png' :
        ext === 'webp' ? 'image/webp' :
        'image/jpeg';
      return `data:${mime};base64,${buf.toString('base64')}`;
    } catch (err) {
      this.logger.warn(`Could not read photo ${abs}: ${(err as Error).message}`);
      return null;
    }
  }
}
