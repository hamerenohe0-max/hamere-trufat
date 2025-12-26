import { useLocalSearchParams, Link } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useArticleDetail,
  useBookmarkArticle,
  useReactToArticle,
} from '../../../src/features/articles/hooks/useArticles';
import { AuthorCard } from '../../../src/features/articles/components/AuthorCard';
import { ArticleImageGallery } from '../../../src/features/articles/components/ArticleImageGallery';
import { colors } from '../../../src/config/colors';
import * as Haptics from 'expo-haptics';

export default function ArticleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const articleQuery = useArticleDetail(params.id);
  const bookmarkMutation = useBookmarkArticle(params.id);
  const reactMutation = useReactToArticle(params.id);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          style={[styles.reaction, article.reactions?.userReaction === 'like' && styles.reactionActive]}
          onPress={() => {
            reactMutation.mutate('like');
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.reactionText}>
            👍 {article.reactions?.likes || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reaction, article.reactions?.userReaction === 'dislike' && styles.reactionActive]}
          onPress={() => {
            reactMutation.mutate('dislike');
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.reactionText}>
            👎 {article.reactions?.dislikes || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reaction}
          onPress={async () => {
            try {
              await Share.share({
                message: `${article.title}\n\n${article.excerpt || article.content.substring(0, 200)}...`,
              });
            } catch (error) {
              console.error('Error sharing:', error);
            }
          }}
        >
          <Text style={styles.reactionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reaction}
          onPress={() => {
            bookmarkMutation.mutate();
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.reactionText}>
            {article.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </Text>
        </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  reaction: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reactionActive: {
    backgroundColor: colors.primary.main,
  },
  reactionText: {
    color: colors.primary.darkest,
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


