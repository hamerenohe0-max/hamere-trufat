import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomTabBar } from '../../src/components/CustomTabBar';

export default function ProtectedLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
    >
      {/* Order: prayer (1st), news (2nd), articles (3rd), home (4th - center), games (5th), events (6th), settings (7th) */}
      <Tabs.Screen
        name="readings"
        options={{
          href: '/(protected)/readings',
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          href: '/(protected)/news',
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          href: '/(protected)/articles',
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          href: '/(protected)/home',
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          href: '/(protected)/games',
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          href: '/(protected)/events',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: '/(protected)/settings',
        }}
      />
      
      {/* Hidden Screens */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="feasts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
