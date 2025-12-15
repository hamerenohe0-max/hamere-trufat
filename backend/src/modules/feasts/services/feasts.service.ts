import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feast, FeastDocument } from '../schemas/feast.schema';

@Injectable()
export class FeastsService {
  constructor(@InjectModel(Feast.name) private feastModel: Model<FeastDocument>) {}

  async create(createFeastDto: Partial<Feast>, userId: string): Promise<FeastDocument> {
    const feast = new this.feastModel(createFeastDto);
    return feast.save();
  }

  async findAll(filters?: { region?: string; date?: Date; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.region) query.region = filters.region;
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.feastModel.find(query).sort({ date: 1 }).limit(limit).skip(offset).exec(),
      this.feastModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string): Promise<FeastDocument> {
    const feast = await this.feastModel.findById(id).exec();
    if (!feast) {
      throw new NotFoundException(`Feast with ID ${id} not found`);
    }
    feast.views += 1;
    await feast.save();
    return feast;
  }

  async findByDate(date: Date): Promise<FeastDocument | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return this.feastModel.findOne({ date: { $gte: startOfDay, $lte: endOfDay } }).exec();
  }

  async update(id: string, updateDto: Partial<Feast>, userId: string, userRole: string): Promise<FeastDocument> {
    const feast = await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update feasts');
    }
    Object.assign(feast, updateDto);
    return feast.save();
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    await this.findOne(id);
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete feasts');
    }
    await this.feastModel.findByIdAndDelete(id).exec();
  }

  async toggleReminder(id: string, userId: string): Promise<FeastDocument> {
    const feast = await this.findOne(id);
    feast.reminderEnabled = !feast.reminderEnabled;
    return feast.save();
  }
}

