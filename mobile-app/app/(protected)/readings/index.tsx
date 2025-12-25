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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyReading, useReadingReminder } from '../../../src/features/readings/hooks/useDailyReading';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/config/colors';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = dateOnly.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export default function DailyReadingsScreen() {
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const readingQuery = useDailyReading(date);
  const reminderMutation = useReadingReminder();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const reading = readingQuery.data;
  const currentDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setDate(formatDate(prev));
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setDate(formatDate(next));
  };

  const goToToday = () => {
    setDate(formatDate(new Date()));
    setShowDatePicker(false);
  };

  const goToDate = (daysOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    setDate(formatDate(targetDate));
    setShowDatePicker(false);
  };

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Daily Readings</Text>
      
      {/* Date Navigation */}
      <View style={styles.dateNavContainer}>
        <TouchableOpacity
          onPress={goToPreviousDay}
          style={styles.navArrowButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateSelector}
        >
          <Text style={styles.dateDisplay}>{formatDisplayDate(date)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={goToNextDay}
          style={styles.navArrowButton}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Quick Date Selection */}
      <View style={styles.quickDateContainer}>
        <TouchableOpacity
          onPress={() => goToDate(-7)}
          style={styles.quickDateButton}
        >
          <Text style={styles.quickDateText}>7 days ago</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goToToday}
          style={[styles.quickDateButton, currentDate.toDateString() === today.toDateString() && styles.quickDateButtonActive]}
        >
          <Text style={[styles.quickDateText, currentDate.toDateString() === today.toDateString() && styles.quickDateTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => goToDate(7)}
          style={styles.quickDateButton}
        >
          <Text style={styles.quickDateText}>7 days ahead</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dateList}>
              {/* Past dates */}
              <View style={styles.dateGroup}>
                <Text style={styles.dateGroupTitle}>Past Days</Text>
                {Array.from({ length: 30 }, (_, i) => {
                  const pastDate = new Date();
                  pastDate.setDate(pastDate.getDate() - (i + 1));
                  const dateStr = formatDate(pastDate);
                  return (
                    <TouchableOpacity
                      key={dateStr}
                      onPress={() => {
                        setDate(dateStr);
                        setShowDatePicker(false);
                      }}
                      style={[styles.dateListItem, date === dateStr && styles.dateListItemActive]}
                    >
                      <Text style={[styles.dateListItemText, date === dateStr && styles.dateListItemTextActive]}>
                        {formatDisplayDate(dateStr)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Today */}
              <View style={styles.dateGroup}>
                <Text style={styles.dateGroupTitle}>Today</Text>
                <TouchableOpacity
                  onPress={goToToday}
                  style={[styles.dateListItem, date === formatDate(new Date()) && styles.dateListItemActive]}
                >
                  <Text style={[styles.dateListItemText, date === formatDate(new Date()) && styles.dateListItemTextActive]}>
                    Today
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Future dates */}
              <View style={styles.dateGroup}>
                <Text style={styles.dateGroupTitle}>Future Days</Text>
                {Array.from({ length: 30 }, (_, i) => {
                  const futureDate = new Date();
                  futureDate.setDate(futureDate.getDate() + (i + 1));
                  const dateStr = formatDate(futureDate);
                  return (
                    <TouchableOpacity
                      key={dateStr}
                      onPress={() => {
                        setDate(dateStr);
                        setShowDatePicker(false);
                      }}
                      style={[styles.dateListItem, date === dateStr && styles.dateListItemActive]}
                    >
                      <Text style={[styles.dateListItemText, date === dateStr && styles.dateListItemTextActive]}>
                        {formatDisplayDate(dateStr)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {readingQuery.isLoading ? (
        <ActivityIndicator size="large" color={colors.primary.main} />
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
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  dateNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  navArrowButton: {
    padding: 8,
    borderRadius: 8,
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickDateButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickDateButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  quickDateTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  dateList: {
    maxHeight: 400,
  },
  dateGroup: {
    padding: 16,
  },
  dateGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateListItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f8fafc',
  },
  dateListItemActive: {
    backgroundColor: colors.primary.lighter + '20', // 20% opacity
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  dateListItemText: {
    fontSize: 15,
    color: '#0f172a',
  },
  dateListItemTextActive: {
    color: colors.primary.main,
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
    backgroundColor: colors.primary.main,
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
    backgroundColor: colors.primary.main,
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
    borderColor: colors.primary.main,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionOutlineText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
  },
});


