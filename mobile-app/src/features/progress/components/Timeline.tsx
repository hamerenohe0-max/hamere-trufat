import { View, Text } from 'react-native';
import { ProgressReport } from '../../../types/models';

export function Timeline({ timeline }: { timeline: ProgressReport['timeline'] }) {
  return (
    <View style={{ gap: 12 }}>
      {timeline.map((item, index) => (
        <View key={item.date} style={styles.row}>
          <View style={styles.bulletContainer}>
            <View style={styles.bullet} />
            {index !== timeline.length - 1 && <View style={styles.connector} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  bulletContainer: {
    alignItems: 'center' as const,
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    marginTop: 4,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#bfdbfe',
    marginTop: 4,
  },
  label: {
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  description: {
    color: '#475569',
  },
  date: {
    color: '#94a3b8',
    fontSize: 12,
  },
};


