import { StyleSheet, Text, View } from 'react-native';

export default function SyncScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync queue</Text>
      <Text style={styles.subtitle}>
        Offline submissions will appear here once we wire up the data layer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475569',
  },
});


