import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useArticlesList } from '../../../src/features/articles/hooks/useArticles';
import { ArticleCard } from '../../../src/components/ArticleCard';
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';

export default function ArticlesListScreen() {
  const { colors } = useTheme();
  const articlesQuery = useArticlesList();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <ThemedText style={styles.heading}>Spiritual Articles</ThemedText>
        <ThemedText style={styles.subtitle}>
          Long-form reflections curated by clergy, theologians, and historians.
        </ThemedText>

        {articlesQuery.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary.main} />
        ) : (
          (articlesQuery.data as any[])?.map((article) => (
            <ArticleCard key={article.id} article={article} cardWidth="100%" imageHeight={180} />
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
    marginBottom: 8,
  },
});


