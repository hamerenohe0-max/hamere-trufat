import { Image, Text, View, TouchableOpacity } from 'react-native';
import { Author } from '../../../types/models';
import { colors } from '../../../config/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../components/ThemeProvider';
import { ThemedText } from '../../../components/ThemedText';

export function AuthorCard({ author }: { author?: Author }) {
  const { colors: themeColors, isDark } = useTheme();
  const router = useRouter();

  if (!author) return null;

  const handlePress = () => {
    router.push(`/(protected)/articles/author/${author.id}`);
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: themeColors.background.secondary }]} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {author.avatarUrl ? (
          <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <Ionicons name="person" size={24} color={themeColors.text.tertiary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.name}>{author.name}</ThemedText>
        {author.title && <ThemedText style={styles.title}>{author.title}</ThemedText>}
        {author.bio && (
          <ThemedText style={styles.bio} numberOfLines={2}>
            {author.bio}
          </ThemedText>
        )}
        {(author.followers !== undefined || author.articlesCount !== undefined) && (
          <View style={styles.stats}>
            {author.followers !== undefined && (
              <ThemedText style={styles.statText}>
                {author.followers >= 1000
                  ? `${(author.followers / 1000).toFixed(1)}K`
                  : author.followers} followers
              </ThemedText>
            )}
            {author.articlesCount !== undefined && author.articlesCount > 0 && (
              <ThemedText style={styles.statText}>
                • {author.articlesCount} articles
              </ThemedText>
            )}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.text.tertiary} />
    </TouchableOpacity>
  );
}

const styles = {
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
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
  },
  avatarPlaceholder: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 14,
    fontWeight: '500' as const,
    opacity: 0.7,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    opacity: 0.6,
  },
  stats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 4,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    opacity: 0.5,
  },
};


