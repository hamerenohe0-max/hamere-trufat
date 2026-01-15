import React, { useState, useEffect } from 'react';
import { View, Text, Switch, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/config/colors';
import { NotificationService, DEFAULT_PRAYER_ALARMS, PrayerAlarm } from '../../../src/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../../../src/components/ThemedText';
import { useTheme } from '../../../src/components/ThemeProvider';

const ALARMS_STORAGE_KEY = 'prayer_alarms_settings';

export default function AlarmsScreen() {
    const { colors: themeColors, isDark } = useTheme();
    const [alarms, setAlarms] = useState<PrayerAlarm[]>(DEFAULT_PRAYER_ALARMS);

    useEffect(() => {
        loadSettings();
        NotificationService.registerForPushNotificationsAsync();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
            if (stored) {
                setAlarms(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load alarm settings', error);
        }
    };

    const saveSettings = async (newAlarms: PrayerAlarm[]) => {
        try {
            await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(newAlarms));
        } catch (error) {
            console.error('Failed to save alarm settings', error);
        }
    };

    const toggleAlarm = async (id: string, value: boolean) => {
        const newAlarms = alarms.map(alarm => {
            if (alarm.id === id) {
                return { ...alarm, enabled: value };
            }
            return alarm;
        });

        setAlarms(newAlarms);
        saveSettings(newAlarms);

        // Brute force reset: Cancel all and reschedule enabled
        await NotificationService.cancelAllNotifications();

        const enabledAlarms = newAlarms.filter(a => a.enabled);
        for (const alarm of enabledAlarms) {
            await NotificationService.schedulePrayerAlarm(alarm);
        }
    };

    const renderItem = ({ item }: { item: PrayerAlarm }) => (
        <View style={[styles.item, { backgroundColor: themeColors.background.secondary }]}>
            <View style={styles.textContainer}>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.itemSubtitle}>
                    {item.hour.toString().padStart(2, '0')}:{item.minute.toString().padStart(2, '0')}
                </ThemedText>
            </View>
            <Switch
                trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: (isDark ? themeColors.secondary.main : themeColors.primary.main) + '40' }}
                thumbColor={item.enabled ? (isDark ? themeColors.secondary.main : themeColors.primary.main) : (isDark ? '#64748b' : '#f4f3f4')}
                onValueChange={(val) => toggleAlarm(item.id, val)}
                value={item.enabled}
            />
        </View>
    );

    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background.primary }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: themeColors.background.secondary, borderBottomColor: themeColors.border.subtle }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? themeColors.secondary.main : themeColors.primary.main} />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Prayer Alarms</ThemedText>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.headerContent}>
                    <Ionicons name="notifications" size={48} color={isDark ? themeColors.secondary.main : themeColors.primary.main} />
                    <ThemedText style={styles.headerSubtitle}>
                        Get notified for the 7 canonical hours of prayer.
                    </ThemedText>
                </View>
            </View>
            <FlatList
                data={alarms}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.7,
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: 14,
        marginTop: 2,
        fontVariant: ['tabular-nums'],
        opacity: 0.6,
    },
});
