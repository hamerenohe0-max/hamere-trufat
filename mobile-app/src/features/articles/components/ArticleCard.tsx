import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SpiritualArticle } from '../../../types/models';

export function ArticleCard({ article }: { article: SpiritualArticle }) {
  return (
    <Link href={`/(protected)/articles/${article.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {article.coverImage && (
          <Image source={{ uri: article.coverImage }} style={styles.cover} />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.excerpt} numberOfLines={3}>
            {article.excerpt}
          </Text>
          <Text style={styles.meta}>
            {article.author?.name ?? 'Hamere Trufat'} • {article.readingTime}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 16,
  },
  cover: {
    width: '100%' as const,
    height: 180,
  },
  content: {
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  excerpt: {
    color: '#475569',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
  },
};


