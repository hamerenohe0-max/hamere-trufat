import { useLocalSearchParams, Link } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useArticleDetail,
  useBookmarkArticle,
} from '../../../src/features/articles/hooks/useArticles';
import { AuthorCard } from '../../../src/features/articles/components/AuthorCard';
import { ArticleImageGallery } from '../../../src/features/articles/components/ArticleImageGallery';
import * as Haptics from 'expo-haptics';

export default function ArticleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const articleQuery = useArticleDetail(params.id);
  const bookmarkMutation = useBookmarkArticle(params.id);

  if (articleQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!articleQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Article not found.</Text>
      </View>
    );
  }

  const article = articleQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{article.title}</Text>
      <View style={styles.metaContainer}>
        {article.author ? (
          <Link href={`/(protected)/articles/author/${article.author.id}`} asChild>
            <TouchableOpacity>
              <Text style={styles.authorName}>{article.author.name}</Text>
            </TouchableOpacity>
          </Link>
        ) : (
          <Text style={styles.meta}>Hamere Trufat</Text>
        )}
        <Text style={styles.meta}> • {article.readingTime}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            bookmarkMutation.mutate();
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.actionText}>
            {bookmarkMutation.isSuccess && bookmarkMutation.data
              ? bookmarkMutation.data.bookmarked
                ? '★ Bookmarked'
                : '☆ Bookmark'
              : article.bookmarked
                ? '★ Bookmarked'
                : '☆ Bookmark'}
          </Text>
        </TouchableOpacity>
        {article.author && (
          <Link
            href={`/(protected)/articles/author/${article.author.id}`}
            asChild
          >
            <TouchableOpacity style={styles.authorLink}>
              <Text style={styles.authorLinkText}>View author</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>

      <AuthorCard author={article.author} />

      {/* Display article images */}
      {article.images && article.images.length > 0 && (
        <ArticleImageGallery images={article.images} maxDisplay={4} />
      )}

      <Text style={styles.content}>{article.content}</Text>

      <View style={styles.keywords}>
        {article.keywords.map((keyword) => (
          <View key={keyword} style={styles.keyword}>
            <Text style={styles.keywordText}>#{keyword}</Text>
          </View>
        ))}
      </View>
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
    fontSize: 30,
    fontWeight: '700',
  },
  metaContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  meta: {
    color: '#94a3b8',
  },
  authorName: {
    color: '#2563eb',
    fontWeight: '600' as const,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  action: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  authorLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  authorLinkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#111827',
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyword: {
    backgroundColor: '#ecfeff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  keywordText: {
    color: '#0f766e',
  },
});


