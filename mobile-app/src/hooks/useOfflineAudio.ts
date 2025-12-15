import { useState, useEffect } from 'react';
import { AudioService } from '../services/offline/audio.service';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineAudio(audioId: string, remoteUrl?: string) {
  const { isOffline } = useNetworkStatus();
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioId || !remoteUrl) return;

    const loadAudio = async () => {
      setIsLoading(true);
      try {
        // Try to get cached audio first
        const cached = await AudioService.getCachedAudio(audioId);
        if (cached) {
          setLocalUrl(cached);
          setIsLoading(false);
          return;
        }

        // If online, try to cache it
        if (!isOffline && remoteUrl) {
          const cachedPath = await AudioService.cacheAudio(audioId, remoteUrl);
          setLocalUrl(cachedPath);
        } else {
          // Offline and not cached
          setLocalUrl(null);
        }
      } catch (error) {
        console.error('Error loading audio:', error);
        setLocalUrl(remoteUrl || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [audioId, remoteUrl, isOffline]);

  return {
    audioUrl: localUrl || remoteUrl || null,
    isCached: !!localUrl,
    isLoading,
  };
}

