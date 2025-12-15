import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from './useNetworkStatus';

const CACHE_PREFIX = 'query-cache:';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() > entry.expiresAt) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(entry),
    );
  } catch {
    // Ignore cache errors
  }
}

/**
 * Enhanced useQuery hook with offline support
 * Automatically caches responses and serves them when offline
 */
export function useOfflineQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError> & {
    queryKey: string[];
    queryFn: () => Promise<TData>;
    cacheTime?: number;
  },
) {
  const { isOffline } = useNetworkStatus();
  const cacheKey = options.queryKey.join(':');

  return useQuery({
    ...options,
    queryFn: async () => {
      // If offline, try to get cached data first
      if (isOffline) {
        const cached = await getCachedData<TData>(cacheKey);
        if (cached) {
          return cached;
        }
        throw new Error('No cached data available. Please check your internet connection.');
      }

      // Online: fetch fresh data
      try {
        const data = await options.queryFn();
        // Cache the response
        await setCachedData(cacheKey, data);
        return data;
      } catch (error) {
        // On error, try to return cached data as fallback
        const cached = await getCachedData<TData>(cacheKey);
        if (cached) {
          return cached;
        }
        throw error;
      }
    },
    retry: isOffline ? false : options.retry ?? 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    cacheTime: options.cacheTime ?? 1000 * 60 * 60 * 24, // 24 hours default
  });
}

