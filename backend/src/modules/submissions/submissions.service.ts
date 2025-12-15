import { Injectable } from '@nestjs/common';

export interface Submission {
  id: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class SubmissionsService {
  private submissions: Submission[] = [];

  create(payload: Record<string, unknown>): Submission {
    const submission: Submission = {
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      payload,
    };
    this.submissions.push(submission);
    return submission;
  }

  findAll(): Submission[] {
    return this.submissions;
  }
}
