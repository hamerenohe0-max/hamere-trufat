import { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { NewsItem } from '../../../types/models';

export const NewsCard = memo(({ item }: { item: NewsItem }) => {
  return (
    <Link href={`/(protected)/news/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {item['coverImage'] && (
          <Image source={{ uri: item['coverImage'] }} style={styles.cover} />
        )}
        <View style={{ gap: 4 }}>
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
  },
  cover: {
    width: '100%' as const,
    height: 160,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summary: {
    color: '#475569',
    paddingHorizontal: 16,
  },
  meta: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    color: '#94a3b8',
    fontSize: 12,
  },
};


