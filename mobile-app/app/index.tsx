import { useEffect, useState, useRef } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuthStore, selectIsAuthenticated } from '../src/store/useAuthStore';
import { authApi } from '../src/services/auth';
import type { TokenBundle } from '../src/services/auth';
import { SplashScreen } from '../src/components/SplashScreen';

export default function IndexGate() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isGuest = useAuthStore((state) => state.guest);
  const startGuestSession = useAuthStore((state) => state.startGuestSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [hasTriedGuest, setHasTriedGuest] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a local guest session if API fails
  const createLocalGuestSession = () => {
    const localGuestTokens: TokenBundle = {
      accessToken: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `guest_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresIn: 86400 * 7, // 7 days
      refreshExpiresIn: 86400 * 30, // 30 days
      guest: true,
    };
    startGuestSession(localGuestTokens);
  };

  useEffect(() => {
    // Auto-start guest session if not authenticated and not already a guest
    if (hydrated && !isAuthenticated && !isGuest && !isStartingGuest && !hasTriedGuest) {
      setIsStartingGuest(true);
      setHasTriedGuest(true);
      clearSession(); // Clear any existing session first

      // Set a timeout to fallback to local guest session if API takes too long
      timeoutRef.current = setTimeout(() => {
        console.warn('Guest session API timeout, using local guest session');
        createLocalGuestSession();
        setIsStartingGuest(false);
      }, 5000); // 5 second timeout

      // Try to get guest session from API
      authApi.guest()
        .then((response) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          startGuestSession(response.tokens);
          setIsStartingGuest(false);
        })
        .catch((error) => {
          console.error('Failed to start guest session from API:', error);
          // Fallback to local guest session
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          createLocalGuestSession();
          setIsStartingGuest(false);
        });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hydrated, isAuthenticated, isGuest, isStartingGuest, hasTriedGuest, startGuestSession, clearSession]);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#1e6b47" />
      </View>
    );
  }

  // Redirect to home if authenticated or guest
  if (isAuthenticated || isGuest) {
    return <Redirect href="/(protected)/home" />;
  }

  // Show loading while starting guest session (with timeout fallback)
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 12,
      }}
    >
      <ActivityIndicator size="large" color="#1e6b47" />
      <Text style={{ color: '#64748b', fontSize: 14 }}>Starting app...</Text>
    </View>
  );
}
