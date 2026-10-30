import { IsArray, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BiographyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() height?: string;
  @IsOptional() @IsString() weight?: string;
}

export class ContactsDto {
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() linkedin?: string;
}

export class SectionItemDto {
  @IsOptional() @IsString() details?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) notes?: string[];
}

export class ReferenceItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
}

export class ResumePhotoDto {
  @IsString() dataUrl!: string;
}

export class ResumePayloadDto {
  @IsString() title!: string;

  @IsOptional() @IsString() summary?: string;

  @ValidateNested() @Type(() => BiographyDto)
  biography!: BiographyDto;

  @ValidateNested() @Type(() => ContactsDto)
  contacts!: ContactsDto;

  @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  workExperience!: SectionItemDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  education!: SectionItemDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  skills!: SectionItemDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  achievements!: SectionItemDto[];

  @IsOptional()
  @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  languages?: SectionItemDto[];

  @IsOptional()
  @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  hobbies?: SectionItemDto[];

  @IsOptional()
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReferenceItemDto)
  references?: ReferenceItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ResumePhotoDto)
  photo?: ResumePhotoDto;
}

export class CreateJobDto {
  @IsString() jobId!: string;

  @IsUrl({ require_tld: false })
  callbackUrl!: string;

  @IsString() secret!: string;

  @IsOptional() @IsString() template?: string;

  @ValidateNested()
  @Type(() => ResumePayloadDto)
  resume!: ResumePayloadDto;
}

export type JobStatus = 'pending' | 'ready' | 'failed';

export interface JobRecord {
  jobId: string;
  status: JobStatus;
  path: string | null;
  error: string | null;
}
