// Export all offline services
export { getDatabase, closeDatabase } from './database';
export { CacheService } from './cache.service';
export { AudioService } from './audio.service';
export { QueueService } from './queue.service';
export { SyncService } from './sync.service';

// Initialize database on import
import { getDatabase } from './database';
getDatabase().catch((error) => {
  console.error('Failed to initialize offline database:', error);
});

