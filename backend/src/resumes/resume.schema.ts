import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PdfStatus = 'none' | 'pending' | 'ready' | 'failed';
export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ _id: false })
export class Biography {
  @Prop({ type: String, default: '' }) name!: string;
  @Prop({ type: String, default: '' }) address!: string;
  @Prop({ type: String, default: '' }) height!: string;
  @Prop({ type: String, default: '' }) weight!: string;
}
const BiographySchema = SchemaFactory.createForClass(Biography);

@Schema({ _id: false })
export class Contacts {
  @Prop({ type: String, default: '' }) email!: string;
  @Prop({ type: String, default: '' }) phone!: string;
  @Prop({ type: String, default: '' }) website!: string;
  @Prop({ type: String, default: '' }) linkedin!: string;
}
const ContactsSchema = SchemaFactory.createForClass(Contacts);

@Schema({ _id: false })
export class SectionItem {
  @Prop({ type: String, required: true }) id!: string;
  @Prop({ type: String, default: '' }) details!: string;
  @Prop({ type: String, default: '' }) date!: string;
  @Prop({ type: [String], default: [] }) notes!: string[];
}
const SectionItemSchema = SchemaFactory.createForClass(SectionItem);

@Schema({ _id: false })
export class ReferenceItem {
  @Prop({ type: String, required: true }) id!: string;
  @Prop({ type: String, default: '' }) name!: string;
  @Prop({ type: String, default: '' }) phone!: string;
  @Prop({ type: String, default: '' }) email!: string;
  @Prop({ type: String, default: '' }) company!: string;
  @Prop({ type: String, default: '' }) position!: string;
}
const ReferenceItemSchema = SchemaFactory.createForClass(ReferenceItem);

@Schema({ timestamps: true, collection: 'resumes' })
export class Resume {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: String, default: 'classic' })
  template!: string;

  @Prop({ type: String, default: '' })
  summary!: string;

  @Prop({ type: BiographySchema, default: () => ({}) })
  biography!: Biography;

  @Prop({ type: ContactsSchema, default: () => ({}) })
  contacts!: Contacts;

  @Prop({ type: [SectionItemSchema], default: [] })
  workExperience!: SectionItem[];

  @Prop({ type: [SectionItemSchema], default: [] })
  education!: SectionItem[];

  @Prop({ type: [SectionItemSchema], default: [] })
  skills!: SectionItem[];

  @Prop({ type: [SectionItemSchema], default: [] })
  achievements!: SectionItem[];

  @Prop({ type: [SectionItemSchema], default: [] })
  languages!: SectionItem[];

  @Prop({ type: [SectionItemSchema], default: [] })
  hobbies!: SectionItem[];

  @Prop({ type: [ReferenceItemSchema], default: [] })
  references!: ReferenceItem[];

  @Prop({ type: String, default: null })
  photoPath!: string | null;

  @Prop({ type: String, enum: ['none', 'pending', 'ready', 'failed'], default: 'none' })
  pdfStatus!: PdfStatus;

  @Prop({ type: String, default: null })
  pdfJobId!: string | null;

  @Prop({ type: String, default: null })
  pdfError!: string | null;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
