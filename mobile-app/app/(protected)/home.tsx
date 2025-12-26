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
import { useAuthStore } from '../../src/store/useAuthStore';
import { useNewsList } from '../../src/features/news/hooks/useNews';
import { useEvents } from '../../src/features/events/hooks/useEvents';
import { useDailyReading } from '../../src/features/readings/hooks/useDailyReading';
import { useArticlesList } from '../../src/features/articles/hooks/useArticles';
import { colors } from '../../src/config/colors';
import { formatSimpleDate, formatEventDate } from '../../src/utils/dateFormat';
// import { Ionicons } from '@expo/vector-icons'; // Assuming standard expo vector icons

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const newsQuery = useNewsList();
  const eventsQuery = useEvents();
  const articlesQuery = useArticlesList();
  const readingQuery = useDailyReading(today);

  const onRefresh = () => {
    newsQuery.refetch();
    eventsQuery.refetch();
    articlesQuery.refetch();
    readingQuery.refetch();
  };

  const isLoading = newsQuery.isLoading || eventsQuery.isLoading || articlesQuery.isLoading || readingQuery.isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0] ?? 'Friend'}
          </Text>
        </View>
        <TouchableOpacity 
           style={styles.profileButton}
           onPress={() => router.push('/(protected)/settings')}
        >
           {/* Placeholder for user avatar or icon */}
           <View style={styles.avatarPlaceholder} />
        </TouchableOpacity>
      </View>

      {/* Daily Reading Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Word</Text>
        <TouchableOpacity 
          style={styles.readingCard}
          onPress={() => router.push('/(protected)/readings')}
        >
          {readingQuery.data ? (
            <>
              <Text style={styles.readingTitle}>{readingQuery.data.gospel.title}</Text>
              <Text style={styles.readingRef}>{readingQuery.data.gospel.reference}</Text>
              <Text style={styles.readingSnippet} numberOfLines={3}>
                {readingQuery.data.gospel.body}
              </Text>
              <Text style={styles.readMore}>Tap to read more</Text>
            </>
          ) : (
            <Text style={{color: '#64748b'}}>Loading daily reading...</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Latest News Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <Link href="/(protected)/news" asChild>
            <TouchableOpacity>
              <Text style={styles.viewMore}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {newsQuery.data?.slice(0, 5).map((news) => {
            // Get images from images array or fall back to coverImage
            let newsImages: string[] = [];
            if (news.images && Array.isArray(news.images) && news.images.length > 0) {
              newsImages = news.images.filter((img) => img && typeof img === 'string' && img.trim().length > 0);
            }
            if (newsImages.length === 0 && news.coverImage && typeof news.coverImage === 'string' && news.coverImage.trim().length > 0) {
              newsImages = [news.coverImage];
            }
            const coverImage = newsImages.length > 0 ? newsImages[0] : null;
            
            return (
             <Link key={news.id} href={`/(protected)/news/${news.id}`} asChild>
               <TouchableOpacity style={styles.newsCard}>
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
                    <Text style={styles.newsTitle} numberOfLines={2}>{news.title}</Text>
                    <Text style={styles.newsDate}>
                      {formatSimpleDate(news.publishedAt || news.createdAt)}
                    </Text>
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
          <Text style={styles.sectionTitle}>Latest Articles</Text>
          <Link href="/(protected)/articles" asChild>
            <TouchableOpacity>
              <Text style={styles.viewMore}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {articlesQuery.data?.slice(0, 5).map((article) => {
            const coverImage = (article.images && article.images.length > 0) 
              ? article.images[0] 
              : article.coverImage;
            
            return (
              <Link key={article.id} href={`/(protected)/articles/${article.id}`} asChild>
                <TouchableOpacity style={styles.articleCard}>
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
                    <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                    <Text style={styles.articleExcerpt} numberOfLines={2}>
                      {article.excerpt}
                    </Text>
                    <Text style={styles.articleMeta}>
                      {article.author?.name ?? 'Hamere Trufat'} • {article.readingTime}
                    </Text>
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
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Link href="/(protected)/events" asChild>
            <TouchableOpacity>
               <Text style={styles.viewMore}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        {eventsQuery.data?.slice(0, 3).map((event) => (
          <Link key={event.id} href={`/(protected)/events/${event.id}`} asChild>
            <TouchableOpacity style={styles.eventCard}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventDay}>{new Date(event.startDate).getDate()}</Text>
                <Text style={styles.eventMonth}>
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
    gap: 32,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#64748b',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileButton: {
    padding: 4,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cbd5e1',
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
    color: '#0f172a',
  },
  viewMore: {
    color: colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
  },
  // Reading Card
  readingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primary.main,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
    gap: 8,
  },
  readingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  readingRef: {
    color: colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  readingSnippet: {
    color: '#475569',
    lineHeight: 22,
    fontSize: 15,
  },
  readMore: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  // News
  horizontalScroll: {
    gap: 16,
    paddingRight: 24,
  },
  newsCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#fff',
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
    height: 180,
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
    padding: 16,
    gap: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  // Events
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
    backgroundColor: colors.primary.lighter + '20', // 20% opacity
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.main,
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  eventLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  // Articles
  articleCard: {
    width: 280,
    backgroundColor: '#fff',
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
    padding: 16,
    gap: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  articleMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
