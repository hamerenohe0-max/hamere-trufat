import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private usersService: UsersService,
  ) {}

  async create(createNotificationDto: {
    type: Notification['type'];
    title: string;
    body: string;
    targetUserIds?: string[];
    targetRole?: 'all' | 'user' | 'publisher' | 'admin';
    metadata?: Record<string, unknown>;
  }): Promise<NotificationDocument> {
    let targetUserIds: string[] = [];

    if (createNotificationDto.targetUserIds) {
      targetUserIds = createNotificationDto.targetUserIds;
    } else if (createNotificationDto.targetRole) {
      // Get user IDs by role
      const users = await this.usersService.findByRole(createNotificationDto.targetRole === 'all' ? undefined : createNotificationDto.targetRole);
      targetUserIds = users.map((u) => u._id.toString());
    }

    const notification = new this.notificationModel({
      type: createNotificationDto.type,
      title: createNotificationDto.title,
      body: createNotificationDto.body,
      targetUserIds,
      targetRole: createNotificationDto.targetRole,
      metadata: createNotificationDto.metadata || {},
      sentAt: new Date(),
      sentCount: targetUserIds.length,
    });

    return notification.save();
  }

  async findAll(filters?: { userId?: string; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.userId) {
      query.targetUserIds = filters.userId;
    }

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.notificationModel.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset).exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.findOne(id);
    if (!notification.readByUserIds.includes(userId)) {
      notification.readByUserIds.push(userId);
      notification.readCount += 1;
      await notification.save();
    }
    return notification;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.notificationModel.findByIdAndDelete(id).exec();
  }
}

