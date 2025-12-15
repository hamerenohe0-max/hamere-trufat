import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignmentsService {
  private assignments = [
    { id: 'asg_001', title: 'Household Survey', status: 'draft' },
  ];

  findAll() {
    return this.assignments;
  }
}
