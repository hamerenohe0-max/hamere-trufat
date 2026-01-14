import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './ThemedText';
import { useTheme } from './ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
    event: {
        id: string;
        name: string;
        location: string;
        startDate: string;
    };
}

export const EventCard = ({ event }: EventCardProps) => {
    const { colors, isDark } = useTheme();

    const startDate = new Date(event.startDate);
    const day = startDate.getDate();
    const month = startDate.toLocaleDateString('en-US', { month: 'short' });
    const time = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const cardBg = isDark ? colors.background.secondary : colors.background.primary;

    return (
        <Link href={`/(protected)/events/${event.id}`} asChild>
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: cardBg,
                        borderColor: colors.border.light,
                        shadowColor: isDark ? '#000' : colors.neutral.gray[400]
                    }
                ]}
                activeOpacity={0.7}
            >
                <View style={[styles.dateBox, { backgroundColor: isDark ? colors.primary.main : colors.primary.lighter + '20' }]}>
                    <ThemedText style={[styles.dayText, { color: isDark ? '#FFF' : colors.primary.main }]}>{day}</ThemedText>
                    <ThemedText style={[styles.monthText, { color: isDark ? '#FFF' : colors.primary.main }]}>{month}</ThemedText>
                </View>

                <View style={styles.content}>
                    <ThemedText style={styles.title} numberOfLines={1}>
                        {event.name}
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-sharp" size={14} color={colors.secondary.main} />
                            <ThemedText type="secondary" style={styles.infoText} numberOfLines={1}>
                                {event.location}
                            </ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                            <ThemedText type="tertiary" style={styles.infoText}>
                                {time}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray[300]} />
                </View>
            </TouchableOpacity>
        </Link>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 12,
    },
    dateBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 20,
        fontWeight: '800',
    },
    monthText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '500',
    },
    arrowContainer: {
        paddingLeft: 4,
    },
});
