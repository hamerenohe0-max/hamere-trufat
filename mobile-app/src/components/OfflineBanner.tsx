import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { SyncService } from '../services/offline/sync.service';

export function OfflineBanner() {
  const { isOffline, isLoading } = useNetworkStatus();
  const { queueSize, isSyncing } = useOfflineQueue();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (isOffline) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -50,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [isOffline]);

  const handleSync = async () => {
    if (!isOffline) {
      await SyncService.syncQueue();
    }
  };

  if (isLoading || !isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>📡 Offline Mode</Text>
        {queueSize > 0 && (
          <Text style={styles.queueText}>
            {queueSize} action{queueSize !== 1 ? 's' : ''} pending
          </Text>
        )}
      </View>
      {!isOffline && queueSize > 0 && (
        <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
          <Text style={styles.syncText}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  queueText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.9,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

