import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resume.dto';
import { AuthedRequest } from '../common/types';

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? join(process.cwd(), 'data', 'uploads');
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumesController {
  constructor(private readonly service: ResumesService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.service.list(req.user.sub);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateResumeDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Get(':id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.service.findOwned(req.user.sub, id);
  }

  @Patch(':id')
  update(@Req() req: AuthedRequest, @Param('id') id: string, @Body() dto: UpdateResumeDto) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    await this.service.remove(req.user.sub, id);
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 5 * 1024 * 1024 },
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const userId = (req as AuthedRequest).user.sub;
          const dir = join(UPLOAD_ROOT, userId);
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase().replace(/[^.\w]/g, '');
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
          cb(new BadRequestException('Only JPEG, PNG, or WebP images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('photo file is required');
    const relative = `/uploads/${req.user.sub}/${file.filename}`;
    await this.service.setPhoto(req.user.sub, id, relative);
    return { photoPath: relative };
  }
}
