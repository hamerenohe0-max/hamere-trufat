import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBookmarkNews,
  useNewsDetail,
  useReactToNews,
  useTranslateNews,
} from '../../../src/features/news/hooks/useNews';
import { NewsDetailContent } from '../../../src/features/news/components/NewsDetailContent';
import { colors } from '../../../src/config/colors';

export default function NewsDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const newsQuery = useNewsDetail(params.id);
  const reactMutation = useReactToNews(params.id);
  const bookmarkMutation = useBookmarkNews(params.id);
  const translateMutation = useTranslateNews(params.id);

  if (newsQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary.main} />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <NewsDetailContent
            news={news}
            onReact={(value) => reactMutation.mutate(value)}
            onBookmark={() => bookmarkMutation.mutate()}
            onTranslate={(lang) => translateMutation.mutate(lang)}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 100, // Extra padding at bottom for keyboard
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
    color: colors.primary.main,
    fontSize: 14,
  },
});


