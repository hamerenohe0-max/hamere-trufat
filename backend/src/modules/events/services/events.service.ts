import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(createEventDto: Partial<Event>, userId: string): Promise<EventDocument> {
    const event = new this.eventModel(createEventDto);
    return event.save();
  }

  async findAll(filters?: { featured?: boolean; startDate?: Date; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.featured !== undefined) query.featured = filters.featured;
    if (filters?.startDate) query.startDate = { $gte: filters.startDate };

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.eventModel.find(query).sort({ startDate: 1 }).limit(limit).skip(offset).exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    event.views += 1;
    await event.save();
    return event;
  }

  async update(id: string, updateDto: Partial<Event>, userId: string, userRole: string): Promise<EventDocument> {
    const event = await this.findOne(id);
    // Only admins can update events for now
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update events');
    }
    Object.assign(event, updateDto);
    return event.save();
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete events');
    }
    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async toggleReminder(id: string, userId: string): Promise<EventDocument> {
    const event = await this.findOne(id);
    event.reminderEnabled = !event.reminderEnabled;
    return event.save();
  }
}

