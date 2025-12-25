import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useArticlesList } from '../../../src/features/articles/hooks/useArticles';
import { ArticleCard } from '../../../src/features/articles/components/ArticleCard';

export default function ArticlesListScreen() {
  const articlesQuery = useArticlesList();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Spiritual Articles</Text>
      <Text style={styles.subtitle}>
        Long-form reflections curated by clergy, theologians, and historians.
      </Text>

      {articlesQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        articlesQuery.data?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))
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
  },
  subtitle: {
    color: '#475569',
    marginBottom: 8,
  },
});


