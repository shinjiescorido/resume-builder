import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PdfService } from './pdf.service';
import { WebhookSecretGuard } from './webhook.guard';
import { PdfWebhookDto } from './dto/webhook.dto';
import { AuthedRequest } from '../common/types';

@Controller()
export class PdfController {
  constructor(private readonly service: PdfService) {}

  @UseGuards(JwtAuthGuard)
  @Post('resumes/:id/generate-pdf')
  @HttpCode(202)
  generate(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.service.requestGeneration(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('resumes/:id/pdf')
  async download(@Req() req: AuthedRequest, @Param('id') id: string, @Res() res: Response) {
    const stream = await this.service.streamPdf(req.user.sub, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${id}.pdf"`);
    Readable.fromWeb(stream as unknown as ReadableStream).pipe(res);
  }

  @UseGuards(WebhookSecretGuard)
  @Post('internal/pdf-webhook')
  @HttpCode(204)
  async webhook(@Body() dto: PdfWebhookDto) {
    await this.service.handleWebhook(dto.jobId, dto.status, dto.error);
  }
}
