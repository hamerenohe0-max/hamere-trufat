import { memo, useMemo } from 'react';
import { Share, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { NewsDetail } from '../../../types/models';
import { useNewsStore } from '../state/useNewsStore';
import * as Haptics from 'expo-haptics';
import { NewsImageGallery } from './NewsImageGallery';
import { colors } from '../../../config/colors';
import { formatSimpleDate } from '../../../utils/dateFormat';

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
        <Text style={styles.title}>{news.title}</Text>
        <Text style={styles.meta}>{formatSimpleDate(news.publishedAt || news.createdAt)}</Text>
        
        {newsImages.length > 0 && (
          <View style={styles.imageContainer}>
            <NewsImageGallery images={newsImages} height={400} />
          </View>
        )}
        
        <Text style={styles.body}>{news.translation?.body ?? news.content}</Text>

        <View style={styles.tags}>
          {news.tags?.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.reaction, userReaction === 'like' && styles.reactionActive]}
            onPress={() => {
              onReact('like');
            }}
          >
            <Text style={styles.reactionText}>👍 {news.reactions?.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reaction, userReaction === 'dislike' && styles.reactionActive]}
            onPress={() => {
              onReact('dislike');
            }}
          >
            <Text style={styles.reactionText}>👎 {news.reactions?.dislikes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reaction} onPress={handleShare}>
            <Text style={styles.reactionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reaction}
            onPress={() => {
              toggleBookmark(news.id, news.title);
              onBookmark();
              Haptics.selectionAsync();
            }}
          >
            <Text style={styles.reactionText}>
              {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.translateRow}>
          <Text style={styles.meta}>
            {translationLanguage
              ? `Translated to ${translationLanguage}`
              : 'Translate article'}
          </Text>
          <View style={styles.langButtons}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.langButton}
                onPress={() => onTranslate(lang.code)}
              >
                <Text
                  style={[
                    styles.langLabel,
                    translationLanguage === lang.code && styles.langLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
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
    color: '#0f172a',
    marginBottom: 8,
  },
  meta: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  imageContainer: {
    marginVertical: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary.lighter + '20', // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: colors.primary.dark,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  reaction: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reactionActive: {
    backgroundColor: colors.primary.main,
  },
  reactionText: {
    color: colors.primary.darkest,
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
    backgroundColor: '#f8fafc',
  },
  langLabel: {
    color: '#475569',
  },
  langLabelActive: {
    color: colors.primary.main,
    fontWeight: '600' as const,
  },
};


