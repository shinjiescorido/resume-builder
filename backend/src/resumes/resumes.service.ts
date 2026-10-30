import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import { CreateResumeDto, UpdateResumeDto } from './dto/resume.dto';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private readonly model: Model<ResumeDocument>) {}

  list(userId: string) {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
  }

  async findOwned(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Resume not found');
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Resume not found');
    if (doc.userId.toString() !== userId) throw new ForbiddenException();
    return doc;
  }

  create(userId: string, dto: CreateResumeDto) {
    return this.model.create({
      userId: new Types.ObjectId(userId),
      title: dto.title,
      template: 'classic',
      summary: '',
      biography: {},
      contacts: {},
      workExperience: [],
      education: [],
      skills: [],
      achievements: [],
      languages: [],
      hobbies: [],
      references: [],
      photoPath: null,
      pdfStatus: 'none',
      pdfJobId: null,
      pdfError: null,
    });
  }

  async update(userId: string, id: string, dto: UpdateResumeDto) {
    const doc = await this.findOwned(userId, id);
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.template !== undefined && dto.template !== doc.template) {
      doc.template = dto.template;
      // Cached PDF was rendered with the previous template — invalidate it.
      doc.pdfStatus = 'none';
      doc.pdfJobId = null;
      doc.pdfError = null;
    }
    if (dto.summary !== undefined) doc.summary = dto.summary;
    if (dto.biography !== undefined) {
      doc.biography = { ...(doc.biography ?? {}), ...dto.biography } as typeof doc.biography;
      doc.markModified('biography');
    }
    if (dto.contacts !== undefined) {
      doc.contacts = { ...(doc.contacts ?? {}), ...dto.contacts } as typeof doc.contacts;
      doc.markModified('contacts');
    }
    for (const key of ['workExperience', 'education', 'skills', 'achievements', 'languages', 'hobbies'] as const) {
      const value = dto[key];
      if (value !== undefined) {
        doc[key] = value.map((item) => ({
          id: item.id,
          details: item.details ?? '',
          date: item.date ?? '',
          notes: (item.notes ?? []).filter((n) => n !== undefined),
        })) as typeof doc[typeof key];
        doc.markModified(key);
      }
    }
    if (dto.references !== undefined) {
      doc.references = dto.references.map((r) => ({
        id: r.id,
        name: r.name ?? '',
        phone: r.phone ?? '',
        email: r.email ?? '',
        company: r.company ?? '',
        position: r.position ?? '',
      })) as typeof doc.references;
      doc.markModified('references');
    }
    await doc.save();
    return doc;
  }

  async remove(userId: string, id: string) {
    const doc = await this.findOwned(userId, id);
    await doc.deleteOne();
  }

  async setPhoto(userId: string, id: string, relativePath: string) {
    const doc = await this.findOwned(userId, id);
    doc.photoPath = relativePath;
    await doc.save();
    return doc;
  }

  async setPdfPending(userId: string, id: string, jobId: string) {
    const doc = await this.findOwned(userId, id);
    doc.pdfStatus = 'pending';
    doc.pdfJobId = jobId;
    doc.pdfError = null;
    await doc.save();
    return doc;
  }

  async setPdfStatusByJobId(jobId: string, status: 'ready' | 'failed', error?: string) {
    await this.model
      .updateOne(
        { pdfJobId: jobId },
        { $set: { pdfStatus: status, pdfError: error ?? null } },
      )
      .exec();
  }
}
