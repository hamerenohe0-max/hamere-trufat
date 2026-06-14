import { Module } from '@nestjs/common';
import { ReadingsService } from './services/readings.service';
import { ReadingsController } from './controllers/readings.controller';
import { SupabaseModule } from '../../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
