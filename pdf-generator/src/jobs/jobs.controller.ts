import { Body, Controller, Get, HttpCode, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './job.types';

@Controller()
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Post('jobs')
  @HttpCode(202)
  create(@Body() dto: CreateJobDto) {
    return this.service.acceptJob(dto);
  }

  @Get('files/:jobId')
  async download(@Param('jobId') jobId: string, @Res() res: Response) {
    const path = await this.service.getFilePath(jobId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${jobId}.pdf"`);
    createReadStream(path).pipe(res);
  }
}
