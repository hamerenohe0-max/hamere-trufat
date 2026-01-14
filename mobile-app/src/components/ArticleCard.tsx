import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './ThemedText';
import { useTheme } from './ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

interface ArticleCardProps {
    article: {
        id: string;
        title: string;
        excerpt: string;
        images?: string[];
        coverImage?: string;
        author?: { name: string };
        readingTime?: string;
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

    // Featured styles (matching NewsCard featured look)
    const featuredStyles = isFeatured ? {
        backgroundColor: cardBg,
        borderColor: isDark ? 'rgba(157, 101, 49, 0.2)' : '#e2e8f0',
        borderWidth: 1,
        shadowColor: isDark ? colors.secondary.main : '#000',
        shadowOpacity: isDark ? 0.3 : 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 12,
        elevation: isDark ? 5 : 2,
    } : {
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    };

    return (
        <Link href={`/(protected)/articles/${article.id}`} asChild>
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        width: cardWidth,
                        maxWidth: typeof cardWidth === 'number' ? cardWidth : undefined,
                        height: cardHeight,
                    },
                    featuredStyles
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

                <View style={[styles.imageContainer, { height: imageHeight }]}>
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
                <View style={styles.content}>
                    {isFeatured ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary.main }} />
                            <ThemedText style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.secondary.main }}>
                                Article
                            </ThemedText>
                        </View>
                    ) : (
                        <ThemedText type="tertiary" style={styles.date}>
                            Article
                        </ThemedText>
                    )}
                    <ThemedText
                        style={[
                            styles.title,
                            isFeatured && { minHeight: 40, fontSize: 13, lineHeight: 18, letterSpacing: -0.1 }
                        ]}
                        numberOfLines={titleLines}
                    >
                        {isFeatured ? (
                            article.title.split(' ').reduce((acc, word, index) => {
                                if (index % 4 === 0 && index !== 0) return acc + '\n' + word;
                                return acc + ' ' + word;
                            })
                        ) : (
                            article.title
                        )}
                    </ThemedText>

                    {!isFeatured && (
                        <ThemedText type="secondary" style={styles.excerpt} numberOfLines={2}>
                            {article.excerpt}
                        </ThemedText>
                    )}

                    <View style={styles.footer}>
                        <View style={styles.metaItem}>
                            <Ionicons name="person-outline" size={10} color={isFeatured ? colors.secondary.main : colors.text.tertiary} />
                            <ThemedText style={[styles.metaText, isFeatured && { color: colors.secondary.main }]}>
                                {article.author?.name?.split(' ')[0] ?? 'Admin'}
                            </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={10} color={isFeatured ? colors.secondary.main : colors.text.tertiary} />
                            <ThemedText style={[styles.metaText, isFeatured && { color: colors.secondary.main }]}>
                                {article.readingTime || '5 min'}
                            </ThemedText>
                        </View>
                    </View>
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
        overflow: 'visible',
        flexShrink: 0,
        marginVertical: 6,
        marginLeft: 2,
    },
    imageContainer: {
        width: '100%',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 12,
        paddingTop: 10,
        gap: 6,
    },
    date: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 20,
    },
    excerpt: {
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
