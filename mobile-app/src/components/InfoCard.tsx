import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function InfoCard({ title, subtitle, children }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a12',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    gap: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  subtitle: {
    color: '#475569'
  }
});
