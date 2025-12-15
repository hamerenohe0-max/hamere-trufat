import { useOfflineQueue } from './useOfflineQueue';
import { useNetworkStatus } from './useNetworkStatus';
import { CacheService } from '../services/offline/cache.service';

export function useOfflineActions() {
  const { isOffline } = useNetworkStatus();
  const { enqueue } = useOfflineQueue();

  const addComment = async (
    entityType: 'news' | 'article' | 'progress',
    entityId: string,
    body: string,
  ) => {
    if (isOffline) {
      await enqueue('comment', entityType, entityId, { body });
      return { id: `temp-${Date.now()}`, body, createdAt: new Date().toISOString() };
    }
    // Online: call API directly
    throw new Error('Use API directly when online');
  };

  const toggleLike = async (
    entityType: 'news' | 'article' | 'progress',
    entityId: string,
  ) => {
    if (isOffline) {
      await enqueue('like', entityType, entityId, {});
      return { liked: true };
    }
    throw new Error('Use API directly when online');
  };

  const toggleDislike = async (
    entityType: 'news' | 'article' | 'progress',
    entityId: string,
  ) => {
    if (isOffline) {
      await enqueue('dislike', entityType, entityId, {});
      return { disliked: true };
    }
    throw new Error('Use API directly when online');
  };

  const toggleBookmark = async (
    entityType: 'news' | 'article',
    entityId: string,
    data: any,
  ) => {
    const isBookmarked = await CacheService.isBookmarked(entityType, entityId);
    
    if (isBookmarked) {
      await CacheService.removeBookmark(entityType, entityId);
    } else {
      await CacheService.saveBookmark(entityType, entityId, data);
    }

    if (isOffline) {
      await enqueue('bookmark', entityType, entityId, { bookmarked: !isBookmarked });
    }

    return { bookmarked: !isBookmarked };
  };

  return {
    addComment,
    toggleLike,
    toggleDislike,
    toggleBookmark,
  };
}

