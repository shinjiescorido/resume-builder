import { IsIn, IsOptional, IsString } from 'class-validator';

export class PdfWebhookDto {
  @IsString()
  jobId!: string;

  @IsIn(['ready', 'failed'])
  status!: 'ready' | 'failed';

  @IsOptional()
  @IsString()
  error?: string;
}
