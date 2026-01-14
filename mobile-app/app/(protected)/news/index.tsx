import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNewsList } from '../../../src/features/news/hooks/useNews';
import { NewsCard } from '../../../src/components/NewsCard';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function NewsListScreen() {
  const { colors } = useTheme();
  const newsQuery = useNewsList();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <ThemedText style={styles.heading}>Latest News</ThemedText>
        <ThemedText style={styles.subtitle}>
          Stay informed with news from Hamere Trufat and the wider church.
        </ThemedText>

        {newsQuery.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary.main} />
        ) : (newsQuery.data as any[])?.length ? (
          (newsQuery.data as any[]).map((item) => <NewsCard key={item.id} news={item} cardWidth="100%" imageHeight={180} />)
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.background.primary }]}>
            <ThemedText style={styles.emptyText}>No news available.</ThemedText>
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
    padding: 20,
    paddingTop: 16,
    gap: 20,
    backgroundColor: '#f8fafc',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
  },
  empty: {
    padding: 32,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
});


