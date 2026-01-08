import { Image, Text, View, TouchableOpacity } from 'react-native';
import { Author } from '../../../types/models';
import { colors } from '../../../config/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function AuthorCard({ author }: { author?: Author }) {
  const router = useRouter();
  
  if (!author) return null;

  const handlePress = () => {
    router.push(`/(protected)/articles/author/${author.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {author.avatarUrl ? (
          <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={colors.text.tertiary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{author.name}</Text>
        {author.title && <Text style={styles.title}>{author.title}</Text>}
        {author.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {author.bio}
          </Text>
        )}
        {(author.followers !== undefined || author.articlesCount !== undefined) && (
          <View style={styles.stats}>
            {author.followers !== undefined && (
              <Text style={styles.statText}>
                {author.followers >= 1000 
                  ? `${(author.followers / 1000).toFixed(1)}K` 
                  : author.followers} followers
              </Text>
            )}
            {author.articlesCount !== undefined && author.articlesCount > 0 && (
              <Text style={styles.statText}>
                • {author.articlesCount} articles
              </Text>
            )}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

const styles = {
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative' as const,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral.gray[200],
  },
  avatarPlaceholder: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.neutral.gray[100],
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  title: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  bio: {
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 4,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
};


