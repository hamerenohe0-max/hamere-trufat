import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherRequest, PublisherRequestDocument } from '../schemas/publisher-request.schema';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(PublisherRequest.name) private requestModel: Model<PublisherRequestDocument>,
    private usersService: UsersService,
  ) {}

  async createRequest(userId: string): Promise<PublisherRequestDocument> {
    const existing = await this.requestModel.findOne({ userId }).exec();
    if (existing) {
      if (existing.status === 'pending') {
        throw new ForbiddenException('You already have a pending publisher request');
      }
      // If rejected, allow new request
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.requestedAt = new Date();
        existing.reviewedAt = undefined;
        existing.reviewedBy = undefined;
        existing.rejectionReason = undefined;
        return existing.save();
      }
    }

    const request = new this.requestModel({
      userId,
      status: 'pending',
      requestedAt: new Date(),
    });

    return request.save();
  }

  async findAll(filters?: { status?: string; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.status) query.status = filters.status;

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.requestModel
        .find(query)
        .sort({ requestedAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('userId', 'name email')
        .exec(),
      this.requestModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<PublisherRequestDocument> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Publisher request with ID ${id} not found`);
    }
    return request;
  }

  async approve(id: string, reviewerId: string): Promise<PublisherRequestDocument> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new ForbiddenException('Only pending requests can be approved');
    }

    request.status = 'approved';
    request.reviewedAt = new Date();
    request.reviewedBy = reviewerId;

    // Update user role
    const user = await this.usersService.findById(request.userId);
    if (user) {
      user.role = 'publisher';
      await user.save();
    }

    return request.save();
  }

  async reject(id: string, reviewerId: string, reason?: string): Promise<PublisherRequestDocument> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new ForbiddenException('Only pending requests can be rejected');
    }

    request.status = 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = reviewerId;
    if (reason) request.rejectionReason = reason;

    return request.save();
  }
}

