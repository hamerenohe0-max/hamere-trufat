import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useCommentOnProgress,
  useLikeProgress,
  useProgressDetail,
} from '../../../src/features/progress/hooks/useProgressReports';
import { PdfViewer } from '../../../src/features/progress/components/PdfViewer';
import { BeforeAfterGallery } from '../../../src/features/progress/components/BeforeAfter';
import { Timeline } from '../../../src/features/progress/components/Timeline';

export default function ProgressDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const detailQuery = useProgressDetail(params.id);
  const likeMutation = useLikeProgress(params.id);
  const commentMutation = useCommentOnProgress(params.id);

  if (detailQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!detailQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Report not found.</Text>
      </View>
    );
  }

  const report = detailQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{report.title}</Text>
      <Text style={styles.summary}>{report.summary}</Text>

      <PdfViewer url={report.pdfUrl} />
      <BeforeAfterGallery beforeImage={report.beforeImage} afterImage={report.afterImage} />
      <Timeline timeline={report.timeline} />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, report.liked && styles.actionActive]}
          onPress={() => likeMutation.mutate()}
        >
          <Text style={styles.actionText}>
            👍 {likeMutation.isSuccess && likeMutation.data
              ? likeMutation.data.likes
              : report.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            commentMutation.mutate('Great progress!');
          }}
        >
          <Text style={styles.actionText}>
            💬 {report.commentsCount} Comments
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  empty: {
    color: '#94a3b8',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
  },
  summary: {
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
    backgroundColor: '#eef2ff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  actionActive: {
    backgroundColor: '#2563eb',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});


