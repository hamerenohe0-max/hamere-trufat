import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFeastDetail, useFeastReminder } from '../../../src/features/feasts/hooks/useFeasts';

export default function FeastDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const feastQuery = useFeastDetail(params.id);
  const reminderMutation = useFeastReminder(params.id);

  if (feastQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!feastQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Feast not found.</Text>
      </View>
    );
  }

  const feast = feastQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{feast.name}</Text>
      <Text style={styles.date}>
        {new Date(feast.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      {feast.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{feast.description}</Text>
        </View>
      )}

      {feast.biography && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biography</Text>
          <Text style={styles.body}>{feast.biography}</Text>
        </View>
      )}

      {feast.traditions && feast.traditions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traditions</Text>
          {feast.traditions.map((tradition, index) => (
            <View key={index} style={styles.traditionItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.traditionText}>{tradition}</Text>
            </View>
          ))}
        </View>
      )}

      {feast.readings && feast.readings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readings</Text>
          {feast.readings.map((reading, index) => (
            <View key={index} style={styles.readingItem}>
              <Text style={styles.readingText}>{reading}</Text>
            </View>
          ))}
        </View>
      )}

      {feast.prayers && feast.prayers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayers</Text>
          {feast.prayers.map((prayer, index) => (
            <View key={index} style={styles.prayerItem}>
              <Text style={styles.prayerText}>{prayer}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.reminderButton,
          feast.reminderEnabled && styles.reminderButtonActive,
        ]}
        onPress={() => reminderMutation.mutate(!feast.reminderEnabled)}
      >
        <Text
          style={[
            styles.reminderText,
            feast.reminderEnabled && styles.reminderTextActive,
          ]}
        >
          {feast.reminderEnabled ? '🔔 Reminder Enabled' : '🔕 Enable Reminder'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  empty: {
    color: '#94a3b8',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  date: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  traditionItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
  },
  traditionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  readingItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  readingText: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
  },
  prayerItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  reminderButton: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#cbd5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  reminderText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  reminderTextActive: {
    color: '#fff',
  },
});

