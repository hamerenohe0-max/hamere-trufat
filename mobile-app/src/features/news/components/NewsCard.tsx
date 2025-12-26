import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { NewsItem } from '../../../types/models';
import { NewsImageGallery } from './NewsImageGallery';
import { formatSimpleDate } from '../../../utils/dateFormat';

export const NewsCard = memo(({ item }: { item: NewsItem }) => {
  // Get images from images array or fall back to coverImage for backward compatibility
  // Filter out any empty/null values
  let newsImages: string[] = [];
  
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    newsImages = item.images.filter((img) => img && img.trim().length > 0);
  }
  
  // Fallback to coverImage if no images in array
  if (newsImages.length === 0 && item['coverImage'] && item['coverImage'].trim().length > 0) {
    newsImages = [item['coverImage']];
  }

  return (
    <Link href={`/(protected)/news/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {newsImages.length > 0 && (
          <NewsImageGallery images={newsImages} height={250} />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.summary} numberOfLines={2}>
            {item.summary}
          </Text>
          <Text style={styles.meta}>{formatSimpleDate(item.publishedAt || item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
});

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  summary: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
};


