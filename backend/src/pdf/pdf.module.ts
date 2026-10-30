import { Module } from '@nestjs/common';
import { ResumesModule } from '../resumes/resumes.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [ResumesModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
