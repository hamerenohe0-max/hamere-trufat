import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './services/sync.service';
import { SyncController } from './controllers/sync.controller';
import { OfflineCache, OfflineCacheSchema } from './schemas/offline-cache.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: OfflineCache.name, schema: OfflineCacheSchema }])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
