import { Module } from '@nestjs/common';
import { SyncService } from './services/sync.service';
import { SyncController } from './controllers/sync.controller';
import { SupabaseModule } from '../../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
