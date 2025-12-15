import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useProgressList } from '../../../src/features/progress/hooks/useProgressReports';

export default function ProgressListScreen() {
  const progressQuery = useProgressList();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Progress Reports</Text>
      <Text style={styles.subtitle}>
        Track restoration projects, outreach missions, and infrastructure updates.
      </Text>

      {progressQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : progressQuery.data?.length ? (
        progressQuery.data.map((report) => (
          <Link key={report.id} href={`/(protected)/progress/${report.id}`} asChild>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.title}>{report.title}</Text>
              <Text style={styles.summary} numberOfLines={2}>
                {report.summary}
              </Text>
              <Text style={styles.meta}>{report.updatedAt}</Text>
            </TouchableOpacity>
          </Link>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No reports available.</Text>
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
  },
  subtitle: {
    color: '#475569',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  summary: {
    color: '#475569',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
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


