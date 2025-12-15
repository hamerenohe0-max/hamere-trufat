import { useState, useEffect } from 'react';
import { QueueService, ActionType, EntityType } from '../services/offline/queue.service';
import { SyncService } from '../services/offline/sync.service';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineQueue() {
  const { isOffline } = useNetworkStatus();
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update queue size
    QueueService.getQueueSize().then(setQueueSize);

    // Sync when coming back online
    if (!isOffline && queueSize > 0 && !isSyncing) {
      setIsSyncing(true);
      SyncService.syncQueue()
        .then(() => {
          QueueService.getQueueSize().then(setQueueSize);
          setIsSyncing(false);
        })
        .catch(() => setIsSyncing(false));
    }
  }, [isOffline, queueSize, isSyncing]);

  const enqueue = async (
    actionType: ActionType,
    entityType: EntityType,
    entityId: string,
    payload: any,
  ) => {
    await QueueService.enqueue(actionType, entityType, entityId, payload);
    const newSize = await QueueService.getQueueSize();
    setQueueSize(newSize);
  };

  return {
    queueSize,
    isSyncing,
    enqueue,
  };
}

