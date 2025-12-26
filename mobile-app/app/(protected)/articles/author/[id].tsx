import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!authorQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Author not found</Text>
      </View>
    );
  }

  const author = authorQuery.data;
  const articles = articlesQuery.data || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
      {/* Author Profile Summary */}
      <View style={styles.profileSection}>
        {author.avatarUrl && (
          <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
        )}
        <Text style={styles.authorName}>{author.name}</Text>
        {author.title && (
          <Text style={styles.authorTitle}>{author.title}</Text>
        )}
        {author.bio && (
          <Text style={styles.authorBio}>{author.bio}</Text>
        )}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{articles.length}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
        </View>
      </View>

      {/* Recent Posts Section */}
      <View style={styles.articlesSection}>
        <Text style={styles.heading}>Recent Posts</Text>
        {articlesQuery.isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
        ) : articles.length === 0 ? (
          <Text style={styles.emptyText}>No articles yet</Text>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </View>
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
    paddingBottom: 40,
    gap: 24,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
  },
  authorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  authorTitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  authorBio: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    width: '100%',
    justifyContent: 'center',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  articlesSection: {
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  loader: {
    marginVertical: 24,
  },
});


