import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions/submissions.service';
import { SubmissionsController } from './submissions/submissions.controller';

@Module({
  providers: [SubmissionsService],
  controllers: [SubmissionsController],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
