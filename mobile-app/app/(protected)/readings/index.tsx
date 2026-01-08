import { useState, useMemo } from 'react';
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
import { usePrayerReading } from '../../../src/features/prayers/hooks/usePrayerReading';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/config/colors';
import { AudioPlayer } from '../../../src/components/AudioPlayer';

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
  const [activeTab, setActiveTab] = useState<'Morning' | 'Evening'>('Morning');
  const readingQuery = usePrayerReading(date);
  const [language, setLanguage] = useState<'geez' | 'amharic'>('geez');

  // Filter reading based on active tab
  const reading = useMemo(() => {
    if (!readingQuery.data) return null;
    if (Array.isArray(readingQuery.data)) {
      return readingQuery.data.find(r => r.timeOfDay === activeTab);
    }
    return null;
  }, [readingQuery.data, activeTab]);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Daily Readings</Text>
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langButton, language === 'geez' && styles.langButtonActive]}
            onPress={() => setLanguage('geez')}
          >
            <Text style={[styles.langText, language === 'geez' && styles.langTextActive]}>Geez</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === 'amharic' && styles.langButtonActive]}
            onPress={() => setLanguage('amharic')}
          >
            <Text style={[styles.langText, language === 'amharic' && styles.langTextActive]}>Amharic</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Date Navigation */}
        <View style={styles.dateNavContainer}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.navArrowButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
            <Text style={styles.dateDisplay}>{formatDisplayDate(date)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToNextDay} style={styles.navArrowButton}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Morning/Evening Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Morning' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Morning')}
          >
            <Ionicons name="sunny-outline" size={18} color={activeTab === 'Morning' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'Morning' && styles.tabTextActive]}>Morning</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Evening' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Evening')}
          >
            <Ionicons name="moon-outline" size={18} color={activeTab === 'Evening' ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'Evening' && styles.tabTextActive]}>Evening</Text>
          </TouchableOpacity>
        </View>

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
                <TouchableOpacity onPress={goToToday} style={styles.dateListItem}>
                  <Text style={styles.dateListItemText}>Go to Today</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {readingQuery.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary.main} />
        ) : reading ? (
          <View style={{ gap: 24 }}>
            {/* Gospel */}
            <ReadingSection
              title="Gospel"
              refText={reading.gospelRef}
              audioUrl={reading.gospelAudioUrl}
              text={language === 'geez' ? reading.gospelGeez : reading.gospelAmharic}
            />

            {/* Epistle */}
            <ReadingSection
              title="Epistle"
              refText={reading.epistleRef}
              text={language === 'geez' ? reading.epistleGeez : reading.epistleAmharic}
            // No Audio for Epistle
            />

            {/* Acts */}
            <ReadingSection
              title="Acts of the Apostles"
              refText={reading.actsRef}
              text={language === 'geez' ? reading.actsGeez : reading.actsAmharic}
            // No Audio for Acts yet
            />

            {/* Psalms */}
            <ReadingSection
              title="Psalms"
              refText={reading.psalmRef}
              audioUrl={reading.psalmAudioUrl}
              text={language === 'geez' ? reading.psalmGeez : reading.psalmAmharic}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  Share.share({
                    message: `${activeTab} Reading for ${date}\n\nGospel:\n${language === 'geez' ? reading.gospelGeez : reading.gospelAmharic}`,
                  })
                }
              >
                <Text style={styles.actionText}>Share Reading</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.empty}>No {activeTab.toLowerCase()} readings available for this date.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReadingSection({ title, refText, audioUrl, text }: { title: string, refText?: string, audioUrl?: string, text?: string }) {
  if (!text && !audioUrl) return null; // Don't hide if text is missing but audio exists? Or usually text is primary.

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBar} />
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {refText && <Text style={styles.referenceText}>{refText}</Text>}
        </View>
      </View>
      {audioUrl && <AudioPlayer uri={audioUrl} title={`${title} Reading`} />}
      <Text style={styles.body}>
        {text || 'Text not available'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  langButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  langButtonActive: {
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  langTextActive: {
    color: colors.primary.main,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 16,
  },
  dateNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionBar: {
    width: 4,
    height: 32,
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  referenceText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  body: {
    fontSize: 16,
    lineHeight: 28,
    color: '#334155',
    marginBottom: 8,
  },
  actions: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontSize: 16,
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
    maxHeight: '50%',
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
    fontSize: 18,
    fontWeight: '700',
  },
  dateList: {
    padding: 16,
  },
  dateListItem: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  dateListItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
