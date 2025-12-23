import { Module } from '@nestjs/common';
import { ReadingsService } from './services/readings.service';
import { ReadingsController } from './controllers/readings.controller';

@Module({
  imports: [],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
