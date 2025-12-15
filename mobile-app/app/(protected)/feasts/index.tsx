import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useFeasts } from '../../../src/features/feasts/hooks/useFeasts';

export default function FeastsListScreen() {
  const feastsQuery = useFeasts();

  // Group feasts by month
  const feastsByMonth = feastsQuery.data?.reduce((acc, feast) => {
    const month = new Date(feast.date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(feast);
    return acc;
  }, {} as Record<string, typeof feastsQuery.data>) || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Holiday Calendar</Text>
      <Text style={styles.subtitle}>
        Ethiopian Orthodox feasts and celebrations throughout the year.
      </Text>

      {feastsQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : Object.keys(feastsByMonth).length > 0 ? (
        Object.entries(feastsByMonth).map(([month, feasts]) => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthTitle}>{month}</Text>
            {feasts.map((feast) => (
              <Link key={feast.id} href={`/(protected)/feasts/${feast.id}`} asChild>
                <TouchableOpacity style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.date}>
                      {new Date(feast.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <View style={styles.cardText}>
                      <Text style={styles.title}>{feast.name}</Text>
                      {feast.description && (
                        <Text style={styles.description} numberOfLines={2}>
                          {feast.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No feasts available.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
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
  monthSection: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    minWidth: 50,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  description: {
    color: '#64748b',
    fontSize: 14,
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

