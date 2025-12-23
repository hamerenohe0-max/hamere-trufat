import { Module } from '@nestjs/common';
import { SyncService } from './services/sync.service';
import { SyncController } from './controllers/sync.controller';

@Module({
  imports: [],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
