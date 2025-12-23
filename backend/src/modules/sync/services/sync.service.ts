import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class SyncService {
  constructor(private readonly supabase: SupabaseService) {}

  async saveCache(
    userId: string,
    deviceId: string,
    entity: string,
    key: string,
    payload: Record<string, unknown>,
    expiresAt?: Date,
  ): Promise<any> {
    const checksum = this.calculateChecksum(payload);
    const version = Date.now();

    const { data: existing } = await this.supabase.client
      .from('offline_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('entity', entity)
      .eq('key', key)
      .single();

    if (existing) {
      const { data } = await this.supabase.client
        .from('offline_cache')
        .update({
          payload: payload as any,
          checksum,
          version,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        } as any)
        .eq('id', (existing as any).id)
        .select()
        .single();
      return data;
    }

    const { data } = await this.supabase.client
      .from('offline_cache')
      .insert({
        user_id: userId,
        device_id: deviceId,
        entity,
        key,
        payload: payload as any,
        checksum,
        version,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      } as any)
      .select()
      .single();

    return data;
  }

  async getCache(userId: string, deviceId: string, entity: string, key: string): Promise<any | null> {
    const { data } = await this.supabase.client
      .from('offline_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('entity', entity)
      .eq('key', key)
      .single();
    return data;
  }

  async getAllCache(userId: string, deviceId: string, entity?: string) {
    let query = this.supabase.client
      .from('offline_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    if (entity) query = query.eq('entity', entity);

    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  }

  async deleteCache(userId: string, deviceId: string, entity: string, key: string): Promise<void> {
    await this.supabase.client
      .from('offline_cache')
      .delete()
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('entity', entity)
      .eq('key', key);
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

