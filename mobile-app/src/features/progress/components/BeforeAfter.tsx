import { Image, Text, View } from 'react-native';

interface Props {
  beforeImage?: string;
  afterImage?: string;
}

export function BeforeAfterGallery({ beforeImage, afterImage }: Props) {
  if (!beforeImage && !afterImage) return null;

  return (
    <View style={styles.wrapper}>
      {beforeImage && (
        <View style={styles.column}>
          <Text style={styles.label}>Before</Text>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: beforeImage }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </View>
      )}
      {afterImage && (
        <View style={styles.column}>
          <Text style={styles.label}>After</Text>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: afterImage }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  wrapper: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%' as const,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden' as const,
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
};


