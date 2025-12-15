import { QueueService, ActionType, EntityType } from './queue.service';
import { CacheService } from './cache.service';
import NetInfo from '@react-native-community/netinfo';
import { newsApi } from '../../features/news/services/news.api';
import { articlesApi } from '../../features/articles/services/articles.api';
import { feastsApi } from '../../features/feasts/services/feasts.api';
import { readingsApi } from '../../features/readings/services/readings.api';

export class SyncService {
  static async syncQueue(): Promise<{ success: number; failed: number }> {
    const pending = await QueueService.getPendingActions();
    let success = 0;
    let failed = 0;

    for (const action of pending) {
      await QueueService.markProcessing(action.id);

      try {
        await this.processAction(action);
        await QueueService.markCompleted(action.id);
        success++;
      } catch (error) {
        // If retry count is too high, mark as failed
        if (action.retryCount >= 3) {
          await QueueService.markFailed(action.id, false);
        } else {
          await QueueService.markFailed(action.id, true);
        }
        failed++;
      }
    }

    return { success, failed };
  }

  private static async processAction(action: {
    actionType: ActionType;
    entityType: EntityType;
    entityId: string;
    payload: any;
  }): Promise<void> {
    switch (action.actionType) {
      case 'comment':
        if (action.entityType === 'news') {
          await newsApi.addComment(action.entityId, action.payload);
        }
        break;

      case 'like':
        if (action.entityType === 'news') {
          await newsApi.toggleReaction(action.entityId, 'like');
        } else if (action.entityType === 'progress') {
          // await progressApi.toggleLike(action.entityId);
        }
        break;

      case 'dislike':
        if (action.entityType === 'news') {
          await newsApi.toggleReaction(action.entityId, 'dislike');
        }
        break;

      case 'bookmark':
        if (action.entityType === 'news') {
          await newsApi.toggleBookmark(action.entityId);
        } else if (action.entityType === 'article') {
          await articlesApi.toggleBookmark(action.entityId);
        }
        break;

      case 'reaction':
        // Handle other reactions
        break;
    }
  }

  static async syncCacheOnOpen(): Promise<void> {
    try {
      // Cache news
      const news = await newsApi.list();
      if (news?.items) {
        await CacheService.cacheNews(news.items);
      }

      // Cache articles
      const articles = await articlesApi.list();
      if (articles?.items) {
        await CacheService.cacheArticles(articles.items);
      }

      // Cache feasts
      const feasts = await feastsApi.list();
      if (feasts?.items) {
        await CacheService.cacheFeasts(feasts.items);
      }

      // Cache today's reading
      const today = new Date().toISOString().split('T')[0];
      const reading = await readingsApi.getByDate(today);
      if (reading) {
        await CacheService.cacheReading(today, reading);
      }
    } catch (error) {
      console.error('Error syncing cache on open:', error);
      // Continue even if sync fails
    }
  }

  static async syncInBackground(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      return; // Don't sync if offline
    }

    try {
      // Sync queue first
      await this.syncQueue();

      // Then refresh cache
      await this.syncCacheOnOpen();
    } catch (error) {
      console.error('Error in background sync:', error);
    }
  }
}

