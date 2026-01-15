import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useEvents } from '../../../src/features/events/hooks/useEvents';
import { formatEventDate } from '../../../src/utils/dateFormat';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function EventsListScreen() {
  const { colors, isDark } = useTheme();
  const eventsQuery = useEvents();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.primary }]}>
        <ThemedText style={[styles.heading, { color: colors.text.primary }]}>Events</ThemedText>
        <ThemedText style={styles.subtitle}>
          Upcoming church events, celebrations, and gatherings.
        </ThemedText>

        {eventsQuery.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary.main} />
        ) : eventsQuery.data?.length ? (
          eventsQuery.data.map((event) => (
            <Link key={event.id} href={`/(protected)/events/${event.id}`} asChild>
              <TouchableOpacity style={[styles.card, { backgroundColor: colors.background.secondary }]}>
                <View style={styles.cardHeader}>
                  <ThemedText style={[styles.title, { color: colors.text.primary }]}>{event.name}</ThemedText>
                  {event.featured && (
                    <View style={[styles.featuredBadge, { backgroundColor: isDark ? colors.primary.main + '30' : '#fef3c7' }]}>
                      <ThemedText style={[styles.featuredText, { color: isDark ? colors.primary.light : '#92400e' }]}>Featured</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.date, { color: colors.primary.main }]}>
                  {formatEventDate(event.startDate)}
                </ThemedText>
                <ThemedText style={styles.location}>📍 {event.location}</ThemedText>
                {event.description && (
                  <ThemedText style={styles.description} numberOfLines={2}>
                    {event.description}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </Link>
          ))
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.background.secondary }]}>
            <ThemedText style={styles.emptyText}>No events available.</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  featuredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
  },
  date: {
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  empty: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
  },
});

