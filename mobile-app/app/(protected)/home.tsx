import { useRouter, Link } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useAuthStore, selectIsAuthenticated } from '../../src/store/useAuthStore';
import { authApi } from '../../src/services/auth';
import { useDashboardSummary } from '../../src/features/dashboard/hooks/useDashboard';
import { DashboardSections } from '../../src/features/dashboard/components/DashboardSections';

export default function HomeScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const setSession = useAuthStore((state) => state.setSession);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isGuest = useAuthStore((state) => state.guest);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.profile,
    enabled: isAuthenticated,
    onSuccess: (user) => {
      const currentTokens = useAuthStore.getState().tokens;
      if (!currentTokens) return;
      setSession({
        user,
        tokens: currentTokens,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      router.replace('/(auth)/login');
    },
  });

  const dashboardQuery = useDashboardSummary({
    enabled: !profileQuery.isLoading,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={dashboardQuery.isFetching || profileQuery.isFetching}
          onRefresh={() => {
            profileQuery.refetch();
            dashboardQuery.refetch();
          }}
        />
      }
    >
      <Text style={styles.eyebrow}>Hamere Trufat</Text>
      <Text style={styles.heading}>
        {isGuest
          ? 'Welcome'
          : `Hello ${profileQuery.data?.name ?? 'User'}`}
      </Text>
      <Text style={styles.description}>
        Daily readings, news, articles, and spiritual content for the Ethiopian Orthodox community.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Session status</Text>
        <Text style={styles.cardValue}>
          {isGuest ? 'Guest access' : profileQuery.data?.role ?? 'loading...'}
        </Text>
        {!isGuest && (
          <Text style={styles.cardMeta}>
            Last login:{' '}
            {profileQuery.data?.lastLoginAt
              ? new Date(profileQuery.data.lastLoginAt).toLocaleString()
              : '—'}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Link href="/(protected)/profile" style={[styles.actionButton, styles.primary]}>
          <Text style={styles.actionText}>Profile</Text>
        </Link>
        <Link href="/(protected)/sync" style={[styles.actionButton, styles.secondary]}>
          <Text style={styles.secondaryText}>Sync Queue</Text>
        </Link>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          if (isGuest) {
            clearSession();
            router.replace('/(auth)/login');
          } else {
            logoutMutation.mutate();
          }
        }}
      >
        {logoutMutation.isPending ? (
          <ActivityIndicator color="#dc2626" />
        ) : (
          <Text style={styles.logoutText}>
            {isGuest ? 'Exit guest mode' : 'Logout'}
          </Text>
        )}
      </TouchableOpacity>

      {dashboardQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : dashboardQuery.data ? (
        <DashboardSections
          summary={dashboardQuery.data}
          onRefresh={() => dashboardQuery.refetch()}
        />
      ) : (
        <Text style={styles.errorText}>Unable to load dashboard data.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 64,
    gap: 16,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#94a3b8',
    fontSize: 12,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    color: '#475569',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#fff',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
});


