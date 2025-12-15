import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetworkStatus } from './useNetworkStatus';

export function useErrorHandler() {
  const { isOffline } = useNetworkStatus();

  const handleError = useCallback(
    (error: Error | string, options?: { showAlert?: boolean; onRetry?: () => void }) => {
      const message = typeof error === 'string' ? error : error.message;
      
      // Check if it's a network error
      const isNetworkError =
        message.includes('Network') ||
        message.includes('fetch') ||
        message.includes('connection') ||
        isOffline;

      const errorMessage = isNetworkError
        ? 'No internet connection. Please check your network and try again.'
        : message || 'An error occurred. Please try again.';

      if (options?.showAlert) {
        Alert.alert(
          'Error',
          errorMessage,
          options.onRetry
            ? [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: options.onRetry },
              ]
            : [{ text: 'OK' }],
        );
      }

      // Log error for debugging
      console.error('Error handled:', error);

      return errorMessage;
    },
    [isOffline],
  );

  return { handleError };
}

