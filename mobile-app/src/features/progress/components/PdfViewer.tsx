import { Linking, Text, TouchableOpacity, View } from 'react-native';

export function PdfViewer({ url }: { url?: string }) {
  if (!url) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Report PDF</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL(url)}
      >
        <Text style={styles.buttonText}>Open PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  wrapper: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  label: {
    fontWeight: '600' as const,
    color: '#3730a3',
  },
  button: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
};


