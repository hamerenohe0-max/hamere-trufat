import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './ThemedText';
import { useTheme } from './ThemeProvider';
import { formatSimpleDate } from '../utils/dateFormat';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
        borderColor: isDark ? colors.border.light : '#e2e8f0',
    };

    return (
        <Link href={`/(protected)/news/${news.id}`} asChild>
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
                <View style={[styles.imageContainer, { height: imageHeight }]}>
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />
                    )}
                    {/* Subtle Gradient Overlay for depth */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    <View style={styles.metaRow}>
                        <View style={[styles.categoryDot, { backgroundColor: isFeatured ? colors.secondary.main : colors.primary.main }]} />
                        <ThemedText style={[styles.date, isFeatured && { color: colors.secondary.main }]}>
                            {formatSimpleDate(news.publishedAt || news.createdAt)}
                        </ThemedText>
                    </View>


                    <ThemedText
                        style={[
                            styles.title,
                            isFeatured && { minHeight: 72 } // Height for 4 lines (4 * 18)
                        ]}
                        numberOfLines={titleLines}
                        ellipsizeMode="tail"
                    >
                        {isFeatured ? (
                            news.title.split(' ').reduce((acc, word, index) => {
                                if (index % 4 === 0 && index !== 0) return acc + '\n' + word;
                                return acc + ' ' + word;
                            })
                        ) : (
                            news.title
                        )}
                    </ThemedText>
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
        overflow: 'visible', // Must be visible for shadow
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
        borderBottomLeftRadius: 15, // Match card radius manually since overflow visible
        borderBottomRightRadius: 15,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: 0.8,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    date: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#64748B', // Slate 500
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: -0.1,
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
});
