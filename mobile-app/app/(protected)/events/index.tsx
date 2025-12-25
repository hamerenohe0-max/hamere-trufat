import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useEvents } from '../../../src/features/events/hooks/useEvents';

export default function EventsListScreen() {
  const eventsQuery = useEvents();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Events</Text>
      <Text style={styles.subtitle}>
        Upcoming church events, celebrations, and gatherings.
      </Text>

      {eventsQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : eventsQuery.data?.length ? (
        eventsQuery.data.map((event) => (
          <Link key={event.id} href={`/(protected)/events/${event.id}`} asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{event.name}</Text>
                {event.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )}
              </View>
              <Text style={styles.date}>
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.location}>📍 {event.location}</Text>
              {event.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {event.description}
                </Text>
              )}
            </TouchableOpacity>
          </Link>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No events available.</Text>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
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
    color: '#0f172a',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  featuredText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '600',
  },
  date: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    color: '#64748b',
    fontSize: 14,
  },
  description: {
    color: '#475569',
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

