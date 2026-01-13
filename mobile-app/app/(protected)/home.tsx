import { Link, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useNewsList } from '../../src/features/news/hooks/useNews';
import { useEvents } from '../../src/features/events/hooks/useEvents';
import { useDailyReading } from '../../src/features/readings/hooks/useDailyReading';
import { useArticlesList } from '../../src/features/articles/hooks/useArticles';
import { formatSimpleDate } from '../../src/utils/dateFormat';
import { useTheme } from '../../src/components/ThemeProvider';
import { ThemedText } from '../../src/components/ThemedText';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, fontScale, isDark } = useTheme();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const newsQuery = useNewsList();
  const eventsQuery = useEvents();
  const articlesQuery = useArticlesList();
  const readingQuery = useDailyReading(today);

  // Theme-derived background colors
  const screenBg = isDark ? colors.background.primary : colors.background.secondary;
  const cardBg = isDark ? colors.background.secondary : colors.background.primary;

  const onRefresh = () => {
    newsQuery.refetch();
    eventsQuery.refetch();
    articlesQuery.refetch();
    readingQuery.refetch();
  };

  const isLoading = newsQuery.isLoading || eventsQuery.isLoading || articlesQuery.isLoading || readingQuery.isLoading;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: screenBg }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary.main} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </ThemedText>
            <ThemedText style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] ?? 'Friend'}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(protected)/settings')}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? colors.secondary.lighter : colors.primary.light }]}>
                <Ionicons name="person" size={20} color={isDark ? colors.secondary.main : colors.primary.main} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Reading Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Daily Word</ThemedText>
          <TouchableOpacity
            style={[styles.readingCard, { backgroundColor: cardBg, borderColor: colors.border.light }]}
            onPress={() => router.push('/(protected)/readings')}
          >
            {readingQuery.data ? (
              <>
                <Link href="/(protected)/readings" asChild>
                  <TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View style={{ width: 4, height: 40, backgroundColor: isDark ? colors.secondary.main : colors.primary.main, borderRadius: 2, marginRight: 12 }} />
                      <View>
                        <ThemedText style={styles.readingTitle}>{readingQuery.data.gospel.title}</ThemedText>
                        <ThemedText style={styles.readingRef}>{readingQuery.data.gospel.reference}</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
                <ThemedText style={styles.readingSnippet} numberOfLines={3}>
                  {readingQuery.data.gospel.body}
                </ThemedText>
                <ThemedText style={[styles.readMore, { color: isDark ? colors.secondary.main : colors.primary.main }]}>Tap to read more</ThemedText>
              </>
            ) : (
              <ThemedText style={{ color: colors.text.secondary }}>Loading daily reading...</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* Latest News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Latest News</ThemedText>
            <Link href="/(protected)/news" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.viewMore, { color: colors.primary.main }]}>View All</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {(newsQuery.data as any[])?.slice(0, 5).map((news: any) => {
              // Get images from images array or fall back to coverImage
              let newsImages: string[] = [];
              if (news.images && Array.isArray(news.images) && news.images.length > 0) {
                newsImages = news.images.filter((img: any) => img && typeof img === 'string' && img.trim().length > 0);
              }
              if (newsImages.length === 0 && news.coverImage && typeof news.coverImage === 'string' && news.coverImage.trim().length > 0) {
                newsImages = [news.coverImage];
              }
              const coverImage = newsImages.length > 0 ? newsImages[0] : null;

              return (
                <Link key={news.id} href={`/(protected)/news/${news.id}`} asChild>
                  <TouchableOpacity style={[styles.newsCard, { backgroundColor: cardBg }]}>
                    {coverImage ? (
                      <Image
                        source={{ uri: coverImage }}
                        style={styles.newsImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error('News image load error on home:', error.nativeEvent.error);
                        }}
                      />
                    ) : (
                      <View style={styles.newsImagePlaceholder} />
                    )}
                    <View style={styles.newsContent}>
                      <ThemedText style={styles.newsTitle} numberOfLines={2}>{news.title}</ThemedText>
                      <ThemedText style={styles.newsDate}>
                        {formatSimpleDate(news.publishedAt || news.createdAt)}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </ScrollView>
        </View>

        {/* Latest Articles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Latest Articles</ThemedText>
            <Link href="/(protected)/articles" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.viewMore, { color: colors.primary.main }]}>View All</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {(articlesQuery.data as any[])?.slice(0, 5).map((article: any) => {
              const coverImage = (article.images && article.images.length > 0)
                ? article.images[0]
                : article.coverImage;

              return (
                <Link key={article.id} href={`/(protected)/articles/${article.id}`} asChild>
                  <TouchableOpacity style={[styles.articleCard, { backgroundColor: cardBg }]}>
                    {/* Article cover image */}
                    {coverImage ? (
                      <Image
                        source={{ uri: coverImage }}
                        style={styles.articleImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.articleImagePlaceholder} />
                    )}
                    <View style={styles.articleContent}>
                      <ThemedText style={styles.articleTitle} numberOfLines={2}>{article.title}</ThemedText>
                      <ThemedText style={styles.articleExcerpt} numberOfLines={2}>
                        {article.excerpt}
                      </ThemedText>
                      <ThemedText style={styles.articleMeta}>
                        {article.author?.name ?? 'Hamere Trufat'} • {article.readingTime}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </ScrollView>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
            <Link href="/(protected)/events" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.viewMore, { color: colors.primary.main }]}>View All</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.eventsList}>
            {(eventsQuery.data as any[])?.slice(0, 3).map((event: any) => (
              <Link key={event.id} href={`/(protected)/events/${event.id}`} asChild>
                <TouchableOpacity style={[styles.eventCard, { backgroundColor: cardBg }]}>
                  <View style={[styles.eventDateBox, { backgroundColor: colors.primary.lighter + '20' }]}>
                    <ThemedText style={[styles.eventDay, { color: colors.primary.main }]}>{new Date(event.startDate).getDate()}</ThemedText>
                    <ThemedText style={[styles.eventMonth, { color: colors.primary.main }]}>
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </ThemedText>
                  </View>
                  <View style={styles.eventDetails}>
                    <ThemedText style={styles.eventTitle}>{event.name}</ThemedText>
                    <ThemedText style={styles.eventLocation}>{event.location}</ThemedText>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    gap: 32,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileButton: {
    padding: 4,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewMore: {
    fontWeight: '600',
    fontSize: 14,
  },
  // Reading Card
  readingCard: {
    borderRadius: 16,
    padding: 20,
    // Subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 2,
    // Border for definition
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  readingTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  readingRef: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readingSnippet: {
    lineHeight: 24,
    fontSize: 16,
    fontFamily: 'System', // Uses system font with good readability
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  // News
  horizontalScroll: {
    gap: 16,
    paddingRight: 24,
  },
  newsCard: {
    width: 240,
    height: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  newsImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#e2e8f0',
  },
  newsContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    gap: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 12,
    color: '#9D6531', // Secondary color for date/info
  },
  // Events
  eventsList: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  eventDateBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 14,
  },
  // Articles
  articleCard: {
    width: 240,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  articleImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e2e8f0',
  },
  articleImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#e2e8f0',
  },
  articleContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    gap: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
  articleMeta: {
    fontSize: 12,
    color: '#9D6531', // Secondary color for author/meta
  },
});
