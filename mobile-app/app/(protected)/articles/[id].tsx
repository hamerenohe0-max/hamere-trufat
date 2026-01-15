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
import { useTheme } from '../../../src/components/ThemeProvider';
import { ThemedText } from '../../../src/components/ThemedText';
import * as Haptics from 'expo-haptics';

export default function ArticleDetailScreen() {
  const { colors: themeColors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const articleQuery = useArticleDetail(params.id);
  const bookmarkMutation = useBookmarkArticle(params.id);
  const reactMutation = useReactToArticle(params.id);

  if (articleQuery.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background.primary }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  if (!articleQuery.data) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background.primary }]}>
        <ThemedText style={styles.empty}>Article not found.</ThemedText>
      </View>
    );
  }

  const article = articleQuery.data;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background.primary }]}>
        <ThemedText style={styles.heading}>{article.title}</ThemedText>
        <View style={styles.metaContainer}>
          {article.author ? (
            <Link href={`/(protected)/articles/author/${article.author.id}`} asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.authorName, { color: themeColors.primary.main }]}>{article.author.name}</ThemedText>
              </TouchableOpacity>
            </Link>
          ) : (
            <ThemedText style={styles.meta}>Hamere Trufat</ThemedText>
          )}
          <ThemedText style={styles.meta}> • {article.readingTime}</ThemedText>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }, article.reactions?.userReaction === 'like' && { backgroundColor: themeColors.primary.main }]}
            onPress={() => {
              reactMutation.mutate('like');
              Haptics.selectionAsync();
            }}
          >
            <ThemedText style={[styles.reactionText, { color: article.reactions?.userReaction === 'like' ? '#fff' : themeColors.text.secondary }]}>
              👍 {article.reactions?.likes || 0}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }, article.reactions?.userReaction === 'dislike' && { backgroundColor: themeColors.primary.main }]}
            onPress={() => {
              reactMutation.mutate('dislike');
              Haptics.selectionAsync();
            }}
          >
            <ThemedText style={[styles.reactionText, { color: article.reactions?.userReaction === 'dislike' ? '#fff' : themeColors.text.secondary }]}>
              👎 {article.reactions?.dislikes || 0}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }]}
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
            <ThemedText style={[styles.reactionText, { color: themeColors.text.secondary }]}>Share</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }]}
            onPress={() => {
              bookmarkMutation.mutate();
              Haptics.selectionAsync();
            }}
          >
            <ThemedText style={[styles.reactionText, { color: themeColors.text.secondary }]}>
              {article.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <AuthorCard author={article.author} />

        {/* Display article images */}
        {article.images && article.images.length > 0 && (
          <ArticleImageGallery images={article.images} maxDisplay={4} />
        )}

        <ThemedText style={styles.content}>{article.content}</ThemedText>

        <View style={styles.keywords}>
          {article.keywords.map((keyword) => (
            <View key={keyword} style={[styles.keyword, { backgroundColor: themeColors.primary.main + '20' }]}>
              <ThemedText style={[styles.keywordText, { color: themeColors.primary.main }]}>#{keyword}</ThemedText>
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
    opacity: 0.6,
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


