import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import type { Submission } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  list(): Submission[] {
    return this.submissionsService.findAll();
  }

  @Post()
  create(@Body() payload: Record<string, unknown>): Submission {
    return this.submissionsService.create(payload);
  }
}
