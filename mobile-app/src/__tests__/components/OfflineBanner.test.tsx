import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

jest.mock('../../hooks/useNetworkStatus');
jest.mock('../../hooks/useOfflineQueue');

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when online', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOffline: false,
      isLoading: false,
    });
    (useOfflineQueue as jest.Mock).mockReturnValue({
      queueSize: 0,
      isSyncing: false,
    });

    const { queryByText } = render(<OfflineBanner />);
    expect(queryByText('📡 Offline Mode')).toBeNull();
  });

  it('should render when offline', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      isLoading: false,
    });
    (useOfflineQueue as jest.Mock).mockReturnValue({
      queueSize: 0,
      isSyncing: false,
    });

    const { getByText } = render(<OfflineBanner />);
    expect(getByText('📡 Offline Mode')).toBeTruthy();
  });

  it('should show queue size when pending actions exist', () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOffline: true,
      isLoading: false,
    });
    (useOfflineQueue as jest.Mock).mockReturnValue({
      queueSize: 5,
      isSyncing: false,
    });

    const { getByText } = render(<OfflineBanner />);
    expect(getByText('5 actions pending')).toBeTruthy();
  });
});

