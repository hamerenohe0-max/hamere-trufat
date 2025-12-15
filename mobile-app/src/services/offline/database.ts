import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('hamere_trufat.db');
  
  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS news_cache (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      expires_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS articles_cache (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      expires_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS feasts_cache (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      expires_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS readings_cache (
      date TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      expires_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(type, entity_id)
    );
    
    CREATE TABLE IF NOT EXISTS audio_cache (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      local_path TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      expires_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      retry_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending'
    );
    
    CREATE INDEX IF NOT EXISTS idx_news_expires ON news_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_articles_expires ON articles_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_feasts_expires ON feasts_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_readings_expires ON readings_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_type ON bookmarks(type);
    CREATE INDEX IF NOT EXISTS idx_audio_expires ON audio_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_queue_status ON offline_queue(status);
  `);

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

