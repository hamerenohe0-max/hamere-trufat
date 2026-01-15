import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './ThemedText';
import { useTheme } from './ThemeProvider';
import { formatSimpleDate } from '../utils/dateFormat';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface NewsCardProps {
    news: {
        id: string;
        title: string;
        images?: string[];
        coverImage?: string;
        publishedAt?: string;
        createdAt: string;
    };
    cardWidth?: number | string;
    imageHeight?: number;
    variant?: 'standard' | 'featured';
}

export const NewsCard = ({ news, cardWidth = 200, imageHeight = 120, variant = 'standard' }: NewsCardProps) => {
    const { colors, isDark } = useTheme();

    // Image logic
    let newsImages: string[] = [];
    if (news.images && Array.isArray(news.images) && news.images.length > 0) {
        newsImages = news.images.filter((img: any) => img && typeof img === 'string' && img.trim().length > 0);
    }
    if (newsImages.length === 0 && news.coverImage && typeof news.coverImage === 'string' && news.coverImage.trim().length > 0) {
        newsImages = [news.coverImage];
    }
    const coverImage = newsImages.length > 0 ? newsImages[0] : null;

    const isFeatured = variant === 'featured';

    // Glassmorphic background colors (Absolute Minimum)
    const cardBg = isFeatured
        ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.15)')
        : (isDark ? '#1E293B' : '#FFFFFF');

    const cardHeight = isFeatured ? 340 : undefined; // Fixed height only for featured
    const titleLines = isFeatured ? 4 : 3;

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
        <Link href={`/(protected)/news/${news.id}`} asChild>
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
                activeOpacity={0.9}
            >
                {/* Glassmorphic Blur Background */}
                {isFeatured && (
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 5 : 10} // Absolute minimum intensity
                        tint="light"
                        style={[StyleSheet.absoluteFill, { borderRadius: 16, overflow: 'hidden' }]}
                    />
                )}

                {/* Image Section */}
                <View style={[styles.imageContainer, { height: imageHeight }, !isFeatured && styles.standardImageContainer]}>
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />
                    )}
                    {/* Subtle Gradient Overlay for depth */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>

                {/* Content Section */}
                <View style={[styles.content, !isFeatured && styles.standardContent]}>
                    <View style={styles.metaRow}>
                        <View style={[styles.categoryDot, { backgroundColor: isDark ? colors.secondary.main : colors.primary.main }]} />
                        <ThemedText style={[styles.date, { color: isDark ? colors.secondary.light : '#64748B' }]}>
                            {formatSimpleDate(news.publishedAt || news.createdAt)}
                        </ThemedText>
                    </View>


                    <ThemedText
                        style={[
                            styles.title,
                            isFeatured && { minHeight: 72 },
                            !isFeatured && { fontSize: 16, lineHeight: 22, color: isDark ? '#FFFFFF' : '#0F172A' }
                        ]}
                        numberOfLines={titleLines}
                        ellipsizeMode="tail"
                    >
                        {isFeatured ? (
                            (news.title || '').split(' ').reduce((acc, word, index) => {
                                if (index % 4 === 0 && index !== 0) return acc + '\n' + word;
                                return acc + ' ' + word;
                            }, '')
                        ) : (
                            news.title || ''
                        )}
                    </ThemedText>

                    {!isFeatured && (
                        <View style={styles.standardFooter}>
                            <ThemedText style={[styles.readMore, { color: colors.secondary.main }]}>
                                Read Story
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={14} color={colors.secondary.main} />
                        </View>
                    )}
                </View>

                {/* "Frame" overlay effect for featured cards on home page */}
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
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    date: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: -0.1,
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
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
