import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OfflineCache, OfflineCacheDocument } from '../schemas/offline-cache.schema';
import * as crypto from 'crypto';

@Injectable()
export class SyncService {
  constructor(
    @InjectModel(OfflineCache.name) private cacheModel: Model<OfflineCacheDocument>,
  ) {}

  async saveCache(
    userId: string,
    deviceId: string,
    entity: string,
    key: string,
    payload: Record<string, unknown>,
    expiresAt?: Date,
  ): Promise<OfflineCacheDocument> {
    const checksum = this.calculateChecksum(payload);
    const version = Date.now();

    const existing = await this.cacheModel.findOne({ userId, deviceId, entity, key }).exec();
    if (existing) {
      existing.payload = payload;
      existing.checksum = checksum;
      existing.version = version;
      existing.expiresAt = expiresAt;
      return existing.save();
    }

    const cache = new this.cacheModel({
      userId,
      deviceId,
      entity,
      key,
      payload,
      checksum,
      version,
      expiresAt,
    });

    return cache.save();
  }

  async getCache(userId: string, deviceId: string, entity: string, key: string): Promise<OfflineCacheDocument | null> {
    return this.cacheModel.findOne({ userId, deviceId, entity, key }).exec();
  }

  async getAllCache(userId: string, deviceId: string, entity?: string) {
    const query: any = { userId, deviceId };
    if (entity) query.entity = entity;
    return this.cacheModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async deleteCache(userId: string, deviceId: string, entity: string, key: string): Promise<void> {
    await this.cacheModel.deleteOne({ userId, deviceId, entity, key }).exec();
  }

  async syncData(userId: string, deviceId: string, syncData: Array<{
    entity: string;
    key: string;
    payload: Record<string, unknown>;
    version: number;
  }>): Promise<{
    conflicts: Array<{ entity: string; key: string; serverVersion: number; clientVersion: number }>;
    updated: Array<{ entity: string; key: string }>;
  }> {
    const conflicts: Array<{ entity: string; key: string; serverVersion: number; clientVersion: number }> = [];
    const updated: Array<{ entity: string; key: string }> = [];

    for (const item of syncData) {
      const existing = await this.getCache(userId, deviceId, item.entity, item.key);
      if (existing) {
        if (existing.version > item.version) {
          // Server has newer version
          updated.push({ entity: item.entity, key: item.key });
        } else if (existing.version < item.version) {
          // Client has newer version, update server
          await this.saveCache(userId, deviceId, item.entity, item.key, item.payload);
        } else if (existing.checksum !== this.calculateChecksum(item.payload)) {
          // Same version but different content - conflict
          conflicts.push({
            entity: item.entity,
            key: item.key,
            serverVersion: existing.version,
            clientVersion: item.version,
          });
        }
      } else {
        // New item, save it
        await this.saveCache(userId, deviceId, item.entity, item.key, item.payload);
      }
    }

    return { conflicts, updated };
  }

  private calculateChecksum(payload: Record<string, unknown>): string {
    return crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
  }
}

