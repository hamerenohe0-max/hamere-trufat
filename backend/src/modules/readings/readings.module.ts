import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadingsService } from './services/readings.service';
import { ReadingsController } from './controllers/readings.controller';
import { DailyReading, DailyReadingSchema } from './schemas/daily-reading.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DailyReading.name, schema: DailyReadingSchema }])],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
