import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;
}

export class BiographyDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(50)  height?: string;
  @IsOptional() @IsString() @MaxLength(50)  weight?: string;
}

export class ContactsDto {
  @IsOptional() @IsString() @MaxLength(200) email?: string;
  @IsOptional() @IsString() @MaxLength(50)  phone?: string;
  @IsOptional() @IsString() @MaxLength(300) website?: string;
  @IsOptional() @IsString() @MaxLength(300) linkedin?: string;
}

export class SectionItemDto {
  @IsString() @MaxLength(64) id!: string;
  @IsOptional() @IsString() @MaxLength(300) details?: string;
  @IsOptional() @IsString() @MaxLength(100) date?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) notes?: string[];
}

export class ReferenceItemDto {
  @IsString() @MaxLength(64) id!: string;
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(50)  phone?: string;
  @IsOptional() @IsString() @MaxLength(200) email?: string;
  @IsOptional() @IsString() @MaxLength(200) company?: string;
  @IsOptional() @IsString() @MaxLength(200) position?: string;
}

export class UpdateResumeDto {
  @IsOptional() @IsString() @MaxLength(120) title?: string;

  @IsOptional() @IsString() @MaxLength(64) template?: string;

  @IsOptional() @IsString() @MaxLength(4000) summary?: string;

  @IsOptional() @ValidateNested() @Type(() => BiographyDto) biography?: BiographyDto;
  @IsOptional() @ValidateNested() @Type(() => ContactsDto)  contacts?:  ContactsDto;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  workExperience?: SectionItemDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  education?: SectionItemDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  skills?: SectionItemDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  achievements?: SectionItemDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  languages?: SectionItemDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto)
  hobbies?: SectionItemDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ReferenceItemDto)
  references?: ReferenceItemDto[];
}
