import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { registerBackgroundSync } from '../src/services/offline/background-sync';

// Hide native splash screen immediately - we're using a custom one
SplashScreen.hideAsync();

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      }),
  );

  useEffect(() => {
    // Register background sync on app start
    registerBackgroundSync().catch((error) => {
      console.error('Failed to register background sync:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(protected)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
