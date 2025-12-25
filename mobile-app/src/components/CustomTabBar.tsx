import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../config/colors';

interface TabItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isHome?: boolean;
}

const tabs: TabItem[] = [
  { name: 'prayer', route: '/(protected)/readings', icon: 'book-outline', label: 'Prayer' },
  { name: 'news', route: '/(protected)/news', icon: 'newspaper-outline', label: 'News' },
  { name: 'articles', route: '/(protected)/articles', icon: 'document-text-outline', label: 'Articles' },
  { name: 'home', route: '/(protected)/home', icon: 'home', label: 'Home', isHome: true },
  { name: 'games', route: '/(protected)/games', icon: 'game-controller-outline', label: 'Games' },
  { name: 'events', route: '/(protected)/events', icon: 'calendar-outline', label: 'Events' },
  { name: 'settings', route: '/(protected)/settings', icon: 'settings-outline', label: 'Settings' },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => {
    if (route === '/(protected)/home') {
      return pathname === '/home' || pathname === '/(protected)/home' || pathname === '/';
    }
    const routePath = route.replace('/(protected)/', '/');
    return pathname?.startsWith(routePath);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = isActive(tab.route);
          
          if (tab.isHome) {
            return (
              <View key={tab.name} style={styles.homeContainer}>
                <TouchableOpacity
                  style={[styles.homeButton, active && styles.homeButtonActive]}
                  onPress={() => router.push(tab.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={active ? 'home' : 'home-outline'}
                    size={28}
                    color="#ffffff"
                  />
                  {active && <View style={styles.homePulse} />}
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? colors.primary.main : colors.neutral.gray[400]}
              />
              <View style={styles.labelContainer}>
                <View style={[styles.labelDot, active && styles.labelDotActive]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingTop: 8,
    minHeight: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
    minWidth: 48,
    maxWidth: 80,
  },
  homeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginTop: -24, // Detach from bar
  },
  homeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  homeButtonActive: {
    backgroundColor: colors.primary.dark,
    transform: [{ scale: 1.1 }],
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  homePulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  labelContainer: {
    height: 3,
    width: 20,
    marginTop: 2,
  },
  labelDot: {
    height: 3,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  labelDotActive: {
    backgroundColor: colors.primary.main,
    width: 20,
  },
});
