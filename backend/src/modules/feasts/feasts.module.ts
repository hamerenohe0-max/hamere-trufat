import { Module } from '@nestjs/common';
import { FeastsService } from './services/feasts.service';
import { FeastsController } from './controllers/feasts.controller';
import { SupabaseModule } from '../../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FeastsController],
  providers: [FeastsService],
  exports: [FeastsService],
})
export class FeastsModule {}
