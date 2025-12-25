import { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { NewsItem } from '../../../types/models';
import { NewsImageGallery } from './NewsImageGallery';

export const NewsCard = memo(({ item }: { item: NewsItem }) => {
  // Get images from images array or fall back to coverImage for backward compatibility
  const newsImages = item.images || (item['coverImage'] ? [item['coverImage']] : []);
  const coverImage = newsImages.length > 0 ? newsImages[0] : null;

  return (
    <Link href={`/(protected)/news/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {coverImage && (
          <Image 
            source={{ uri: coverImage }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.summary} numberOfLines={2}>
            {item.summary}
          </Text>
          <Text style={styles.meta}>{item.publishedAt}</Text>
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
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
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


