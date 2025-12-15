import { SyncService } from './sync.service';
import { AudioService } from './audio.service';
import { QueueService } from './queue.service';
import NetInfo from '@react-native-community/netinfo';

// Background sync function (can be called by background fetch or manually)
export async function performBackgroundSync() {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return; // Don't sync if offline
    }

    // Clean expired audio
    await AudioService.cleanExpiredAudio();

    // Sync queue
    await SyncService.syncQueue();

    // Clean old queue items
    await QueueService.clearCompleted();

    // Refresh cache
    await SyncService.syncCacheOnOpen();
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Register background sync (using expo-background-fetch if available)
export async function registerBackgroundSync() {
  try {
    // Try to use expo-background-fetch if available
    const BackgroundFetch = await import('expo-background-fetch').catch(() => null);
    const TaskManager = await import('expo-task-manager').catch(() => null);

    if (BackgroundFetch && TaskManager) {
      const BACKGROUND_SYNC_TASK = 'background-sync';

      TaskManager.default.defineTask(BACKGROUND_SYNC_TASK, async () => {
        await performBackgroundSync();
        return BackgroundFetch.default.BackgroundFetchResult.NewData;
      });

      await BackgroundFetch.default.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } else {
      // Fallback: Use app state changes to trigger sync
      console.log('Background fetch not available, using app state sync');
    }
  } catch (error) {
    console.error('Failed to register background sync:', error);
    // Continue without background sync - app will still work
  }
}

export async function unregisterBackgroundSync() {
  try {
    const BackgroundFetch = await import('expo-background-fetch').catch(() => null);
    const TaskManager = await import('expo-task-manager').catch(() => null);

    if (BackgroundFetch && TaskManager) {
      await BackgroundFetch.default.unregisterTaskAsync('background-sync');
    }
  } catch (error) {
    console.error('Failed to unregister background sync:', error);
  }
}
