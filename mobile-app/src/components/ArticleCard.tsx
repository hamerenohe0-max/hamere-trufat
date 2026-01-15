import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './ThemedText';
import { useTheme } from './ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { formatSimpleDate } from '../utils/dateFormat';

interface ArticleCardProps {
    article: {
        id: string;
        title: string;
        excerpt: string;
        images?: string[];
        coverImage?: string;
        author?: { name: string };
        readingTime?: string;
        publishedAt?: string;
        createdAt?: string;
    };
    cardWidth?: number | string;
    imageHeight?: number;
    variant?: 'standard' | 'featured';
}

export const ArticleCard = ({ article, cardWidth = '100%', imageHeight = 160, variant = 'standard' }: ArticleCardProps) => {
    const { colors, isDark } = useTheme();

    const coverImage = (article.images && article.images.length > 0)
        ? article.images[0]
        : article.coverImage;

    const isFeatured = variant === 'featured';

    // Glassmorphic background colors (Absolute Minimum)
    const cardBg = isFeatured
        ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.15)')
        : (isDark ? colors.background.secondary : colors.background.primary);

    const cardHeight = isFeatured ? 300 : undefined;
    const titleLines = isFeatured ? 2 : 2;

    // featured variant specific shadow/border (matches daily reading card)
    const cardStyles = isFeatured ? {
        backgroundColor: cardBg,
        borderColor: isDark ? 'rgba(157, 101, 49, 0.2)' : '#e2e8f0',
        borderWidth: 1,
        shadowColor: isDark ? colors.secondary.main : '#000',
        shadowOpacity: isDark ? 0.3 : 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 12,
        elevation: isDark ? 5 : 2,
    } : {
        backgroundColor: isDark ? colors.background.secondary : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(157, 101, 49, 0.15)' : 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 3,
    };

    return (
        <Link href={`/(protected)/articles/${article.id}`} asChild>
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        width: cardWidth as any,
                        maxWidth: typeof cardWidth === 'number' ? cardWidth : undefined,
                        height: cardHeight,
                    },
                    cardStyles
                ]}
                activeOpacity={0.7}
            >
                {/* Glassmorphic Blur Background */}
                {isFeatured && (
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 5 : 10} // Absolute minimum intensity
                        tint="light"
                        style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]}
                    />
                )}

                <View style={[styles.imageContainer, { height: imageHeight }, !isFeatured && styles.standardImageContainer]}>
                    {coverImage ? (
                        <Image
                            source={{ uri: coverImage }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />
                    )}
                </View>
                <View style={[styles.content, !isFeatured && styles.standardContent]}>
                    {isFeatured ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary.main }} />
                            <ThemedText style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.secondary.main }}>
                                Article
                            </ThemedText>
                        </View>
                    ) : (
                        <ThemedText type="tertiary" style={styles.date}>
                            {formatSimpleDate(article.createdAt || article.publishedAt)}
                        </ThemedText>
                    )}
                    <ThemedText
                        style={[
                            styles.title,
                            isFeatured && { minHeight: 40, fontSize: 13, lineHeight: 18, letterSpacing: -0.1 },
                            !isFeatured && { fontSize: 17, lineHeight: 24, color: isDark ? '#FFFFFF' : '#0F172A' }
                        ]}
                        numberOfLines={titleLines}
                    >
                        {isFeatured ? (
                            (article.title || '').split(' ').reduce((acc, word, index) => {
                                if (index % 4 === 0 && index !== 0) return acc + '\n' + word;
                                return acc + ' ' + word;
                            }, '')
                        ) : (
                            article.title || ''
                        )}
                    </ThemedText>

                    {!isFeatured && (
                        <ThemedText type="secondary" style={styles.excerpt} numberOfLines={2}>
                            {article.excerpt}
                        </ThemedText>
                    )}

                    <View style={styles.footer}>
                        <View style={styles.metaItem}>
                            <Ionicons name="person-outline" size={12} color={isDark ? colors.secondary.main : colors.primary.main} />
                            <ThemedText style={[styles.metaText, { color: isDark ? colors.secondary.light : colors.text.secondary }]}>
                                {article.author?.name?.split(' ')[0] ?? 'Admin'}
                            </ThemedText>
                        </View>
                        <View style={[styles.metaItem, { marginLeft: 'auto' }]}>
                            <Ionicons name="time-outline" size={12} color={isDark ? colors.secondary.main : colors.primary.main} />
                            <ThemedText style={[styles.metaText, { color: isDark ? colors.secondary.light : colors.text.secondary }]}>
                                {article.readingTime || '5 min'}
                            </ThemedText>
                        </View>
                    </View>

                    {!isFeatured && (
                        <View style={styles.standardFooter}>
                            <ThemedText style={[styles.readMore, { color: colors.secondary.main }]}>
                                Read Story
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={14} color={colors.secondary.main} />
                        </View>
                    )}
                </View>

                {/* "Frame" overlay effect for featured cards */}
                {isFeatured && (
                    <View
                        style={[
                            StyleSheet.absoluteFillObject,
                            {
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                                pointerEvents: 'none'
                            }
                        ]}
                    />
                )}
            </TouchableOpacity>
        </Link>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        flexShrink: 0,
        marginVertical: 10,
        marginHorizontal: 2,
    },
    standardImageContainer: {
        borderBottomWidth: 3,
        borderBottomColor: '#9D6531', // Accent brand color
    },
    imageContainer: {
        width: '100%',
        overflow: 'hidden',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 16,
        gap: 8,
    },
    standardContent: {
        paddingTop: 12,
    },
    date: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 20,
    },
    excerpt: {
        fontSize: 14,
        lineHeight: 20,
        color: '#64748B',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
        paddingBottom: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    standardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    readMore: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
