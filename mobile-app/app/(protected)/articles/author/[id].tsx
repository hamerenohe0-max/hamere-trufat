import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useArticlesByAuthor,
  useAuthorProfile,
} from '../../../../src/features/articles/hooks/useArticles';
import { PublisherProfile } from '../../../../src/features/articles/components/PublisherProfile';
import { ArticleCard } from '../../../../src/components/ArticleCard';
import { useTheme } from '../../../../src/components/ThemeProvider';
import { ThemedText } from '../../../../src/components/ThemedText';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthorScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const authorQuery = useAuthorProfile(params.id);
  const articlesQuery = useArticlesByAuthor(params.id);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const { colors, fontScale, isDark } = useTheme();

  if (authorQuery.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!authorQuery.data) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background.primary }]}>
        <ThemedText style={styles.emptyText}>Author not found</ThemedText>
      </View>
    );
  }

  const author = authorQuery.data;
  const articles = articlesQuery.data || [];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API call
  };

  const renderArticles = () => {
    if (articlesQuery.isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      );
    }

    if (articles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
          <ThemedText style={styles.emptyText}>No articles yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Check back later for new content</ThemedText>
        </View>
      );
    }

    if (viewMode === 'grid') {
      return (
        <View style={styles.gridContainer}>
          {(articles as any[]).map((article) => {
            const coverImage = article.images && article.images.length > 0
              ? article.images[0]
              : article.coverImage;
            return (
              <Link key={article.id} href={`/(protected)/articles/${article.id}`} asChild>
                <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.background.secondary }]}>
                  {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.gridImage} />
                  ) : (
                    <View style={[styles.gridImage, styles.gridImagePlaceholder, { backgroundColor: colors.background.tertiary }]}>
                      <Ionicons name="document-text" size={32} color={colors.text.tertiary} />
                    </View>
                  )}
                  <View style={styles.gridOverlay}>
                    <Ionicons name="heart-outline" size={16} color={colors.text.inverse} />
                    <ThemedText style={styles.gridLikes}>{article.reactions?.likes || 0}</ThemedText>
                  </View>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {(articles as any[]).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.secondary }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background.secondary }]} showsVerticalScrollIndicator={false}>
        {/* Social Media Style Profile Header */}
        <PublisherProfile
          author={author}
          articlesCount={articles.length}
          onFollow={handleFollow}
          isFollowing={isFollowing}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content based on active tab */}
        {activeTab === 'posts' ? (
          <>
            {/* View Mode Toggle */}
            {articles.length > 0 && (
              <View style={styles.viewModeContainer}>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                  onPress={() => setViewMode('list')}
                >
                  <Ionicons
                    name="list"
                    size={20}
                    color={viewMode === 'list' ? colors.primary.main : colors.text.tertiary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
                  onPress={() => setViewMode('grid')}
                >
                  <Ionicons
                    name="grid"
                    size={20}
                    color={viewMode === 'grid' ? colors.primary.main : colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Articles Section */}
            <View style={styles.articlesSection}>
              {renderArticles()}
            </View>
          </>
        ) : (
          <View style={styles.aboutSection}>
            <View style={[styles.aboutCard, { backgroundColor: colors.background.primary }]}>
              <ThemedText style={styles.aboutTitle}>About</ThemedText>
              {author.bio ? (
                <ThemedText style={styles.aboutText}>{author.bio}</ThemedText>
              ) : (
                <ThemedText style={styles.aboutEmpty}>No bio available</ThemedText>
              )}
            </View>
            <View style={[styles.aboutCard, { backgroundColor: colors.background.primary }]}>
              <ThemedText style={styles.aboutTitle}>Statistics</ThemedText>
              <View style={[styles.statRow, { borderBottomColor: colors.border.light }]}>
                <ThemedText style={styles.statLabel}>Total Articles</ThemedText>
                <ThemedText style={styles.statValue}>{articles.length}</ThemedText>
              </View>
              {author.followers !== undefined && (
                <View style={[styles.statRow, { borderBottomColor: colors.border.light }]}>
                  <ThemedText style={styles.statLabel}>Followers</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {author.followers >= 1000
                      ? `${(author.followers / 1000).toFixed(1)}K`
                      : author.followers}
                  </ThemedText>
                </View>
              )}
              {author.createdAt && (
                <View style={[styles.statRow, { borderBottomColor: colors.border.light }]}>
                  <ThemedText style={styles.statLabel}>Member Since</ThemedText>
                  <ThemedText style={styles.statValue}>
                    {new Date(author.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  viewModeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
  },
  articlesSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    gap: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  gridLikes: {
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  aboutSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  aboutCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  aboutEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
