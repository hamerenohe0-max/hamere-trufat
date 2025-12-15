import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDailyReading, useReadingReminder } from '../../../src/features/readings/hooks/useDailyReading';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function DailyReadingsScreen() {
  const [date, setDate] = useState(() => formatDate(new Date()));
  const readingQuery = useDailyReading(date);
  const reminderMutation = useReadingReminder();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const reading = readingQuery.data;

  async function toggleAudio() {
    if (!reading?.gospel.audioUrl) return;
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync({
      uri: reading.gospel.audioUrl,
    });
    setSound(newSound);
    await newSound.playAsync();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Daily Readings</Text>
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={() => {
            const next = new Date(date);
            next.setDate(next.getDate() - 1);
            setDate(formatDate(next));
          }}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>Yesterday</Text>
        </TouchableOpacity>
        <Text style={styles.date}>{date}</Text>
        <TouchableOpacity
          onPress={() => {
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            setDate(formatDate(next));
          }}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>Tomorrow</Text>
        </TouchableOpacity>
      </View>

      {readingQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : reading ? (
        <View style={{ gap: 16 }}>
          <ReadingSection title="Gospel" body={reading.gospel.body} reference={reading.gospel.reference} />
          <TouchableOpacity style={styles.audioButton} onPress={toggleAudio}>
            <Text style={styles.audioText}>▶ Play audio</Text>
          </TouchableOpacity>
          <ReadingSection title="Epistle" body={reading.epistle.body} reference={reading.epistle.reference} />
          <ReadingSection title="Psalms" body={reading.psalms.join('\n')} />
          <ReadingSection title="Reflections" body={reading.reflections.join('\n\n')} />

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Share.share({
                  message: `${reading.gospel.title}\n${reading.gospel.reference}\n\n${reading.gospel.body}`,
                })
              }
            >
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={() =>
                reminderMutation.mutate({ date, enabled: !reading.reminderEnabled })
              }
            >
              <Text style={styles.actionOutlineText}>
                {reading.reminderEnabled ? 'Disable reminder' : 'Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>No readings available.</Text>
      )}
    </ScrollView>
  );
}

function ReadingSection({
  title,
  body,
  reference,
}: {
  title: string;
  body: string;
  reference?: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {reference && <Text style={styles.reference}>{reference}</Text>}
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  date: {
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  reference: {
    color: '#94a3b8',
  },
  body: {
    color: '#1f2937',
    lineHeight: 22,
  },
  audioButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  audioText: {
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionOutlineText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
  },
});


