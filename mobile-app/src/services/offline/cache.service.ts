import { getDatabase } from './database';

const DEFAULT_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const READINGS_CACHE_DURATION = 1000 * 60 * 60 * 48; // 48 hours for readings

export class CacheService {
  private static async cleanExpired(table: string): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(`DELETE FROM ${table} WHERE expires_at IS NOT NULL AND expires_at < ?`, [now]);
  }

  // News cache
  static async cacheNews(news: any[]): Promise<void> {
    const db = await getDatabase();
    await this.cleanExpired('news_cache');
    
    for (const item of news) {
      const expiresAt = Date.now() + DEFAULT_CACHE_DURATION;
      await db.runAsync(
        `INSERT OR REPLACE INTO news_cache (id, data, cached_at, expires_at) VALUES (?, ?, ?, ?)`,
        [item.id, JSON.stringify(item), Date.now(), expiresAt]
      );
    }
  }

  static async getCachedNews(): Promise<any[]> {
    const db = await getDatabase();
    await this.cleanExpired('news_cache');
    
    const result = await db.getAllAsync<{ data: string }>(
      `SELECT data FROM news_cache ORDER BY cached_at DESC LIMIT 50`
    );
    
    return result.map((row) => JSON.parse(row.data));
  }

  static async getCachedNewsItem(id: string): Promise<any | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ data: string }>(
      `SELECT data FROM news_cache WHERE id = ?`,
      [id]
    );
    
    return result ? JSON.parse(result.data) : null;
  }

  // Articles cache
  static async cacheArticles(articles: any[]): Promise<void> {
    const db = await getDatabase();
    await this.cleanExpired('articles_cache');
    
    for (const item of articles) {
      const expiresAt = Date.now() + DEFAULT_CACHE_DURATION;
      await db.runAsync(
        `INSERT OR REPLACE INTO articles_cache (id, data, cached_at, expires_at) VALUES (?, ?, ?, ?)`,
        [item.id, JSON.stringify(item), Date.now(), expiresAt]
      );
    }
  }

  static async getCachedArticles(): Promise<any[]> {
    const db = await getDatabase();
    await this.cleanExpired('articles_cache');
    
    const result = await db.getAllAsync<{ data: string }>(
      `SELECT data FROM articles_cache ORDER BY cached_at DESC LIMIT 50`
    );
    
    return result.map((row) => JSON.parse(row.data));
  }

  static async getCachedArticle(id: string): Promise<any | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ data: string }>(
      `SELECT data FROM articles_cache WHERE id = ?`,
      [id]
    );
    
    return result ? JSON.parse(result.data) : null;
  }

  // Feasts cache
  static async cacheFeasts(feasts: any[]): Promise<void> {
    const db = await getDatabase();
    await this.cleanExpired('feasts_cache');
    
    for (const item of feasts) {
      const expiresAt = Date.now() + DEFAULT_CACHE_DURATION;
      await db.runAsync(
        `INSERT OR REPLACE INTO feasts_cache (id, data, cached_at, expires_at) VALUES (?, ?, ?, ?)`,
        [item.id, JSON.stringify(item), Date.now(), expiresAt]
      );
    }
  }

  static async getCachedFeasts(): Promise<any[]> {
    const db = await getDatabase();
    await this.cleanExpired('feasts_cache');
    
    const result = await db.getAllAsync<{ data: string }>(
      `SELECT data FROM feasts_cache ORDER BY cached_at DESC`
    );
    
    return result.map((row) => JSON.parse(row.data));
  }

  static async getCachedFeast(id: string): Promise<any | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ data: string }>(
      `SELECT data FROM feasts_cache WHERE id = ?`,
      [id]
    );
    
    return result ? JSON.parse(result.data) : null;
  }

  // Readings cache
  static async cacheReading(date: string, reading: any): Promise<void> {
    const db = await getDatabase();
    await this.cleanExpired('readings_cache');
    
    const expiresAt = Date.now() + READINGS_CACHE_DURATION;
    await db.runAsync(
      `INSERT OR REPLACE INTO readings_cache (date, data, cached_at, expires_at) VALUES (?, ?, ?, ?)`,
      [date, JSON.stringify(reading), Date.now(), expiresAt]
    );
  }

  static async getCachedReading(date: string): Promise<any | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ data: string }>(
      `SELECT data FROM readings_cache WHERE date = ?`,
      [date]
    );
    
    return result ? JSON.parse(result.data) : null;
  }

  static async getCachedReadings(): Promise<any[]> {
    const db = await getDatabase();
    await this.cleanExpired('readings_cache');
    
    const result = await db.getAllAsync<{ date: string; data: string }>(
      `SELECT date, data FROM readings_cache ORDER BY date DESC LIMIT 30`
    );
    
    return result.map((row) => ({ date: row.date, ...JSON.parse(row.data) }));
  }

  // Bookmarks (saved content)
  static async saveBookmark(type: 'news' | 'article', entityId: string, data: any): Promise<void> {
    const db = await getDatabase();
    const id = `${type}_${entityId}`;
    await db.runAsync(
      `INSERT OR REPLACE INTO bookmarks (id, type, entity_id, data, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, type, entityId, JSON.stringify(data), Date.now()]
    );
  }

  static async removeBookmark(type: 'news' | 'article', entityId: string): Promise<void> {
    const db = await getDatabase();
    const id = `${type}_${entityId}`;
    await db.runAsync(`DELETE FROM bookmarks WHERE id = ?`, [id]);
  }

  static async getBookmarks(type?: 'news' | 'article'): Promise<any[]> {
    const db = await getDatabase();
    let result;
    
    if (type) {
      result = await db.getAllAsync<{ data: string }>(
        `SELECT data FROM bookmarks WHERE type = ? ORDER BY created_at DESC`,
        [type]
      );
    } else {
      result = await db.getAllAsync<{ data: string }>(
        `SELECT data FROM bookmarks ORDER BY created_at DESC`
      );
    }
    
    return result.map((row) => JSON.parse(row.data));
  }

  static async isBookmarked(type: 'news' | 'article', entityId: string): Promise<boolean> {
    const db = await getDatabase();
    const id = `${type}_${entityId}`;
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM bookmarks WHERE id = ?`,
      [id]
    );
    
    return (result?.count ?? 0) > 0;
  }

  // Clear all caches
  static async clearAllCaches(): Promise<void> {
    const db = await getDatabase();
    await db.execAsync(`
      DELETE FROM news_cache;
      DELETE FROM articles_cache;
      DELETE FROM feasts_cache;
      DELETE FROM readings_cache;
    `);
  }
}

