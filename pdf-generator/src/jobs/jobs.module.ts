import { Module } from '@nestjs/common';
import { BrowserProvider } from './browser.provider';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  controllers: [JobsController],
  providers: [BrowserProvider, JobsService],
})
export class JobsModule {}
