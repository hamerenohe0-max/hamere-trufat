import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNewsList } from '../../../src/features/news/hooks/useNews';
import { NewsCard } from '../../../src/features/news/components/NewsCard';

export default function NewsListScreen() {
  const newsQuery = useNewsList();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Latest News</Text>
      <Text style={styles.subtitle}>
        Stay informed with news from Hamere Trufat and the wider church.
      </Text>

      {newsQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : newsQuery.data?.length ? (
        newsQuery.data.map((item) => <NewsCard key={item.id} item={item} />)
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No news available.</Text>
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


