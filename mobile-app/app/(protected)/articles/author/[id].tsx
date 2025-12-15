import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import {
  useArticlesByAuthor,
  useAuthorProfile,
} from '../../../../src/features/articles/hooks/useArticles';
import { AuthorCard } from '../../../../src/features/articles/components/AuthorCard';
import { ArticleCard } from '../../../../src/features/articles/components/ArticleCard';

export default function AuthorScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const authorQuery = useAuthorProfile(params.id);
  const articlesQuery = useArticlesByAuthor(params.id);

  if (authorQuery.isLoading) {
    return (
      <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 48 }} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthorCard author={authorQuery.data} />

      <Text style={styles.heading}>Articles</Text>
      {articlesQuery.isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        articlesQuery.data?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))
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
    fontSize: 22,
    fontWeight: '700',
  },
});


