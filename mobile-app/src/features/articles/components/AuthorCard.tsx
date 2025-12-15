import { Image, Text, View } from 'react-native';
import { Author } from '../../../types/models';

export function AuthorCard({ author }: { author?: Author }) {
  if (!author) return null;

  return (
    <View style={styles.card}>
      {author.avatarUrl && (
        <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
      )}
      <View>
        <Text style={styles.name}>{author.name}</Text>
        {author.title && <Text style={styles.title}>{author.title}</Text>}
        {author.bio && <Text style={styles.bio}>{author.bio}</Text>}
      </View>
    </View>
  );
}

const styles = {
  card: {
    flexDirection: 'row' as const,
    gap: 12,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  name: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  title: {
    color: '#64748b',
  },
  bio: {
    marginTop: 4,
    color: '#475569',
  },
};


