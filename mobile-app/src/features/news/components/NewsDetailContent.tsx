import { memo, useMemo } from 'react';
import { Share, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { NewsDetail } from '../../../types/models';
import { useNewsStore } from '../state/useNewsStore';
import * as Haptics from 'expo-haptics';
import { NewsImageGallery } from './NewsImageGallery';
import { colors } from '../../../config/colors';
import { formatSimpleDate } from '../../../utils/dateFormat';
import { useTheme } from '../../../components/ThemeProvider';
import { ThemedText } from '../../../components/ThemedText';

interface Props {
  news: NewsDetail;
  onReact: (value: 'like' | 'dislike') => void;
  onBookmark: () => void;
  onTranslate: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'am', label: 'Amharic' },
  { code: 'en', label: 'English' },
  { code: 'ti', label: 'Tigrinya' },
];

export const NewsDetailContent = memo(
  ({ news, onReact, onBookmark, onTranslate }: Props) => {
    const { colors: themeColors, isDark } = useTheme();
    const { toggleBookmark } = useNewsStore();
    const userReaction = news.reactions?.userReaction ?? null;
    const bookmarked = news.bookmarked ?? false;

    const translationLanguage = news.translation?.language;
    const sharePayload = useMemo(
      () => `${news.title}\n\n${news.summary}\n\n${news.translation?.body ?? news.content}`,
      [news],
    );

    async function handleShare() {
      await Share.share({ message: sharePayload });
    }

    // Get images from news item (images array or fallback to coverImage)
    // Filter out any empty/null values
    let newsImages: string[] = [];

    if (news.images && Array.isArray(news.images) && news.images.length > 0) {
      newsImages = news.images.filter((img) => img && img.trim().length > 0);
    }

    // Fallback to coverImage if no images in array
    if (newsImages.length === 0 && news['coverImage'] && news['coverImage'].trim().length > 0) {
      newsImages = [news['coverImage']];
    }

    return (
      <View style={{ gap: 16 }}>
        <ThemedText style={styles.title}>{news.title}</ThemedText>
        <ThemedText style={styles.meta}>{formatSimpleDate(news.publishedAt || news.createdAt)}</ThemedText>

        {newsImages.length > 0 && (
          <View style={styles.imageContainer}>
            <NewsImageGallery images={newsImages} height={400} />
          </View>
        )}

        <ThemedText style={styles.body}>{news.translation?.body ?? news.content}</ThemedText>

        <View style={styles.tags}>
          {news.tags?.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: themeColors.primary.main + '20' }]}>
              <ThemedText style={[styles.tagText, { color: themeColors.primary.main }]}>#{tag}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }, userReaction === 'like' && { backgroundColor: themeColors.primary.main }]}
            onPress={() => {
              onReact('like');
            }}
          >
            <ThemedText style={[styles.reactionText, { color: userReaction === 'like' ? '#fff' : themeColors.text.secondary }]}>👍 {news.reactions?.likes || 0}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }, userReaction === 'dislike' && { backgroundColor: themeColors.primary.main }]}
            onPress={() => {
              onReact('dislike');
            }}
          >
            <ThemedText style={[styles.reactionText, { color: userReaction === 'dislike' ? '#fff' : themeColors.text.secondary }]}>👎 {news.reactions?.dislikes || 0}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.reaction, { borderColor: themeColors.border.subtle }]} onPress={handleShare}>
            <ThemedText style={[styles.reactionText, { color: themeColors.text.secondary }]}>Share</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reaction, { borderColor: themeColors.border.subtle }]}
            onPress={() => {
              toggleBookmark(news.id, news.title);
              onBookmark();
              Haptics.selectionAsync();
            }}
          >
            <ThemedText style={[styles.reactionText, { color: themeColors.text.secondary }]}>
              {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.translateRow}>
          <ThemedText style={styles.meta}>
            {translationLanguage
              ? `Translated to ${translationLanguage}`
              : 'Translate article'}
          </ThemedText>
          <View style={styles.langButtons}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langButton, { backgroundColor: themeColors.background.secondary }]}
                onPress={() => onTranslate(lang.code)}
              >
                <ThemedText
                  style={[
                    styles.langLabel,
                    translationLanguage === lang.code && { color: themeColors.primary.main, fontWeight: '700' },
                  ]}
                >
                  {lang.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  },
);


const styles = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.6,
  },
  imageContainer: {
    marginVertical: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  reaction: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reactionText: {
    fontWeight: '600' as const,
  },
  translateRow: {
    gap: 8,
  },
  langButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  langButton: {
    padding: 6,
    borderRadius: 10,
  },
  langLabel: {
    fontSize: 14,
  },
};


