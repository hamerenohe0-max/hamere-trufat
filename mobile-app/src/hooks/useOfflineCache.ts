import { useEffect, useState } from 'react';
import { CacheService } from '../services/offline/cache.service';
import { SyncService } from '../services/offline/sync.service';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineCache() {
  const { isOffline } = useNetworkStatus();
  const [isCaching, setIsCaching] = useState(false);

  useEffect(() => {
    // Cache on app open (when online)
    if (!isOffline && !isCaching) {
      setIsCaching(true);
      SyncService.syncCacheOnOpen()
        .then(() => setIsCaching(false))
        .catch(() => setIsCaching(false));
    }
  }, [isOffline]);

  return {
    isCaching,
    cacheNews: CacheService.cacheNews,
    cacheArticles: CacheService.cacheArticles,
    cacheFeasts: CacheService.cacheFeasts,
    cacheReading: CacheService.cacheReading,
    getCachedNews: CacheService.getCachedNews,
    getCachedArticles: CacheService.getCachedArticles,
    getCachedFeasts: CacheService.getCachedFeasts,
    getCachedReading: CacheService.getCachedReading,
  };
}

