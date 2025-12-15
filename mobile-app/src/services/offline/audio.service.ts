import * as FileSystem from 'expo-file-system';
import { getDatabase } from './database';

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio/`;
const AUDIO_CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

export class AudioService {
  static async ensureCacheDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
    }
  }

  static async cacheAudio(id: string, url: string): Promise<string> {
    await this.ensureCacheDir();
    const db = await getDatabase();
    
    // Check if already cached
    const existing = await db.getFirstAsync<{ local_path: string }>(
      `SELECT local_path FROM audio_cache WHERE id = ?`,
      [id]
    );
    
    if (existing) {
      const fileInfo = await FileSystem.getInfoAsync(existing.local_path);
      if (fileInfo.exists) {
        // Update expiry
        const expiresAt = Date.now() + AUDIO_CACHE_DURATION;
        await db.runAsync(
          `UPDATE audio_cache SET expires_at = ? WHERE id = ?`,
          [expiresAt, id]
        );
        return existing.local_path;
      }
    }

    // Download and cache
    const localPath = `${AUDIO_CACHE_DIR}${id}.mp3`;
    const downloadResult = await FileSystem.downloadAsync(url, localPath);
    
    if (downloadResult.status === 200) {
      const expiresAt = Date.now() + AUDIO_CACHE_DURATION;
      await db.runAsync(
        `INSERT OR REPLACE INTO audio_cache (id, url, local_path, cached_at, expires_at) VALUES (?, ?, ?, ?, ?)`,
        [id, url, localPath, Date.now(), expiresAt]
      );
      return localPath;
    }
    
    throw new Error('Failed to download audio');
  }

  static async getCachedAudio(id: string): Promise<string | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ local_path: string }>(
      `SELECT local_path FROM audio_cache WHERE id = ?`,
      [id]
    );
    
    if (result) {
      const fileInfo = await FileSystem.getInfoAsync(result.local_path);
      if (fileInfo.exists) {
        return result.local_path;
      } else {
        // File doesn't exist, remove from cache
        await db.runAsync(`DELETE FROM audio_cache WHERE id = ?`, [id]);
      }
    }
    
    return null;
  }

  static async getCachedAudioUrl(id: string, remoteUrl: string): Promise<string> {
    const cached = await this.getCachedAudio(id);
    if (cached) {
      return cached;
    }
    
    // Try to cache in background (don't wait)
    this.cacheAudio(id, remoteUrl).catch(() => {
      // Ignore errors
    });
    
    return remoteUrl;
  }

  static async cleanExpiredAudio(): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    
    const expired = await db.getAllAsync<{ id: string; local_path: string }>(
      `SELECT id, local_path FROM audio_cache WHERE expires_at < ?`,
      [now]
    );
    
    for (const item of expired) {
      try {
        await FileSystem.deleteAsync(item.local_path, { idempotent: true });
      } catch {
        // Ignore errors
      }
    }
    
    await db.runAsync(`DELETE FROM audio_cache WHERE expires_at < ?`, [now]);
  }

  static async clearAudioCache(): Promise<void> {
    const db = await getDatabase();
    const all = await db.getAllAsync<{ local_path: string }>(
      `SELECT local_path FROM audio_cache`
    );
    
    for (const item of all) {
      try {
        await FileSystem.deleteAsync(item.local_path, { idempotent: true });
      } catch {
        // Ignore errors
      }
    }
    
    await db.runAsync(`DELETE FROM audio_cache`);
  }
}

