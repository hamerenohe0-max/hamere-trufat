import { Link, useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SpiritualArticle } from '../../../types/models';

export function ArticleCard({ article }: { article: SpiritualArticle }) {
  const router = useRouter();
  // Use first image from images array, or fallback to coverImage
  const coverImage = article.images && article.images.length > 0 
    ? article.images[0] 
    : article.coverImage;

  const handleAuthorPress = (e: any) => {
    e.stopPropagation();
    if (article.author?.id) {
      router.push(`/(protected)/articles/author/${article.author.id}`);
    }
  };

  return (
    <Link href={`/(protected)/articles/${article.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {coverImage && (
          <Image source={{ uri: coverImage }} style={styles.cover} />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.excerpt} numberOfLines={3}>
            {article.excerpt}
          </Text>
          <View style={styles.metaContainer}>
            {article.author ? (
              <TouchableOpacity onPress={handleAuthorPress} style={styles.authorLink}>
                <Text style={styles.authorName}>{article.author.name}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.meta}>Hamere Trufat</Text>
            )}
            <Text style={styles.meta}> • {article.readingTime}</Text>
          </View>
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
  metaContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  authorLink: {
    // Make it look clickable
  },
  authorName: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600' as const,
  },
};


