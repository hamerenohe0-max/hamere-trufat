import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProgressReport, ProgressReportDocument } from '../schemas/progress-report.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ProgressReport.name) private progressModel: Model<ProgressReportDocument>,
  ) {}

  async create(createProgressDto: Partial<ProgressReport>, userId: string): Promise<ProgressReportDocument> {
    const progress = new this.progressModel(createProgressDto);
    return progress.save();
  }

  async findAll(filters?: { limit?: number; offset?: number }) {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.progressModel.find().sort({ createdAt: -1 }).limit(limit).skip(offset).exec(),
      this.progressModel.countDocuments().exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<ProgressReportDocument> {
    const progress = await this.progressModel.findById(id).exec();
    if (!progress) {
      throw new NotFoundException(`Progress report with ID ${id} not found`);
    }
    return progress;
  }

  async update(id: string, updateDto: Partial<ProgressReport>, userId: string, userRole: string): Promise<ProgressReportDocument> {
    const progress = await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update progress reports');
    }
    Object.assign(progress, updateDto);
    return progress.save();
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete progress reports');
    }
    await this.progressModel.findByIdAndDelete(id).exec();
  }

  async toggleLike(id: string, userId: string): Promise<ProgressReportDocument> {
    const progress = await this.findOne(id);
    const index = progress.likedBy.indexOf(userId);
    if (index > -1) {
      progress.likedBy.splice(index, 1);
      progress.likes = Math.max(0, progress.likes - 1);
    } else {
      progress.likedBy.push(userId);
      progress.likes += 1;
    }
    return progress.save();
  }
}

