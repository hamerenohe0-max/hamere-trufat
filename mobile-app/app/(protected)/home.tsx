import { Link, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEvents } from '../../src/features/events/hooks/useEvents';
import { useDailyReading } from '../../src/features/readings/hooks/useDailyReading';
import { useNewsList } from '../../src/features/news/hooks/useNews';
import { useTheme } from '../../src/components/ThemeProvider';
import { ThemedText } from '../../src/components/ThemedText';
import { EventCard } from '../../src/components/EventCard';
import { NewsCard } from '../../src/components/NewsCard';
import { ArticleCard } from '../../src/components/ArticleCard';
import { useArticlesList } from '../../src/features/articles/hooks/useArticles';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const eventsQuery = useEvents();
  const readingQuery = useDailyReading(today);
  const newsQuery = useNewsList();
  const articlesQuery = useArticlesList();

  // Theme-derived background colors
  const screenBg = isDark ? colors.background.primary : colors.background.secondary;
  const cardBg = isDark ? colors.background.secondary : colors.background.primary;

  const onRefresh = () => {
    eventsQuery.refetch();
    readingQuery.refetch();
    newsQuery.refetch();
  };

  const isLoading =
    eventsQuery.isLoading ||
    readingQuery.isLoading ||
    newsQuery.isLoading ||
    articlesQuery.isLoading;

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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
            snapToInterval={220} // 200 (width) + 20 (marginRight)
            snapToAlignment="start"
            style={styles.scrollViewBleed}
          >
            {newsQuery.isLoading ? (
              <ActivityIndicator size="small" color={colors.primary.main} />
            ) : (
              (newsQuery.data as any[])?.slice(0, 5).map((news: any) => (
                <View key={news.id} style={{ marginRight: 20 }}>
                  <NewsCard news={news} cardWidth={200} imageHeight={180} variant="featured" />
                </View>
              ))
            )}
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
            snapToInterval={220} // 200 (width) + 20 (marginRight)
            snapToAlignment="start"
            style={styles.scrollViewBleed}
          >
            {articlesQuery.isLoading ? (
              <ActivityIndicator size="small" color={colors.primary.main} />
            ) : (
              (articlesQuery.data as any[])?.slice(0, 5).map((article: any) => (
                <View key={article.id} style={{ marginRight: 20 }}>
                  <ArticleCard article={article} cardWidth={200} imageHeight={180} variant="featured" />
                </View>
              ))
            )}
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
              <EventCard key={event.id} event={event} />
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
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingRight: 0,
  },
  scrollViewBleed: {
    marginHorizontal: -20,
  },
  eventsList: {
    gap: 16,
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
  eventLocation: {
    fontSize: 14,
    color: '#64748b',
  },
});
