import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyReading, DailyReadingDocument } from '../schemas/daily-reading.schema';

@Injectable()
export class ReadingsService {
  constructor(
    @InjectModel(DailyReading.name) private readingModel: Model<DailyReadingDocument>,
  ) {}

  async create(createReadingDto: Partial<DailyReading>): Promise<DailyReadingDocument> {
    const reading = new this.readingModel(createReadingDto);
    return reading.save();
  }

  async findAll(filters?: { language?: string; limit?: number; offset?: number }) {
    const query: any = {};
    if (filters?.language) query.language = filters.language;

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const [items, total] = await Promise.all([
      this.readingModel.find(query).sort({ date: -1 }).limit(limit).skip(offset).exec(),
      this.readingModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async findByDate(date: Date): Promise<DailyReadingDocument | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return this.readingModel.findOne({ date: { $gte: startOfDay, $lte: endOfDay } }).exec();
  }

  async findClosest(date: Date): Promise<DailyReadingDocument | null> {
    // Find the closest reading to the given date
    const readings = await this.readingModel
      .find({
        date: { $lte: date },
      })
      .sort({ date: -1 })
      .limit(1)
      .exec();

    if (readings.length > 0) {
      return readings[0];
    }

    // If no past reading, get the next one
    const futureReadings = await this.readingModel
      .find({
        date: { $gte: date },
      })
      .sort({ date: 1 })
      .limit(1)
      .exec();

    return futureReadings.length > 0 ? futureReadings[0] : null;
  }

  async findOne(id: string): Promise<DailyReadingDocument> {
    const reading = await this.readingModel.findById(id).exec();
    if (!reading) {
      throw new NotFoundException(`Daily reading with ID ${id} not found`);
    }
    return reading;
  }

  async update(id: string, updateDto: Partial<DailyReading>): Promise<DailyReadingDocument> {
    const reading = await this.findOne(id);
    Object.assign(reading, updateDto);
    return reading.save();
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.readingModel.findByIdAndDelete(id).exec();
  }
}

