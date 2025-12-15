import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  useAddNewsComment,
  useBookmarkNews,
  useNewsComments,
  useNewsDetail,
  useReactToNews,
  useTranslateNews,
} from '../../../src/features/news/hooks/useNews';
import { NewsDetailContent } from '../../../src/features/news/components/NewsDetailContent';
import { NewsComments } from '../../../src/features/news/components/NewsComments';

export default function NewsDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const newsQuery = useNewsDetail(params.id);
  const commentsQuery = useNewsComments(params.id);
  const reactMutation = useReactToNews(params.id);
  const bookmarkMutation = useBookmarkNews(params.id);
  const translateMutation = useTranslateNews(params.id);
  const commentMutation = useAddNewsComment(params.id);

  if (newsQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!newsQuery.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>News article not found.</Text>
      </View>
    );
  }

  const news = newsQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NewsDetailContent
        news={news}
        onReact={(value) => reactMutation.mutate(value)}
        onBookmark={() => bookmarkMutation.mutate()}
        onTranslate={(lang) => translateMutation.mutate(lang)}
      />

      <NewsComments
        comments={commentsQuery.data ?? []}
        onSubmit={async (body) => {
          await commentMutation.mutateAsync(body);
          commentsQuery.refetch();
        }}
      />

      {news.related?.length ? (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.relatedHeading}>Related news</Text>
          {news.related.map((related) => (
            <Link key={related.id} href={`/(protected)/news/${related.id}`} asChild>
              <TouchableOpacity style={styles.relatedItem}>
                <Text style={styles.relatedItemText}>• {related.title}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      ) : null}
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
  emptyText: {
    color: '#94a3b8',
  },
  relatedHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  relatedItem: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  relatedItemText: {
    color: '#2563eb',
    fontSize: 14,
  },
});


