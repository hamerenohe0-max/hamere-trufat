import React, { useState, useEffect } from 'react';
import { View, Text, Switch, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../config/colors';
import { NotificationService, DEFAULT_PRAYER_ALARMS, PrayerAlarm } from '../../../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALARMS_STORAGE_KEY = 'prayer_alarms_settings';

export default function AlarmsScreen() {
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

        const alarmToUpdate = newAlarms.find(a => a.id === id);

        if (value && alarmToUpdate) {
            await NotificationService.scheduleNotificationAsync(alarmToUpdate);
            Alert.alert('Alarm Set', `Notification set for ${alarmToUpdate.title} at ${alarmToUpdate.hour}:00`);
        } else {
            // In a real app with notification IDs, we would cancel the specific ID.
            // For now, re-scheduling all active alarms is a safe brute-force strategy
            // or simply cancelling all and re-adding enabled ones.
            await NotificationService.cancelAllNotifications();
            const enabledAlarms = newAlarms.filter(a => a.enabled);
            for (const alarm of enabledAlarms) {
                await NotificationService.scheduleNotificationAsync(alarm);
            }
        }
    };

    // Fix: Update NotificationService to match the call signature used above if needed
    // or update this component to match the service. 
    // The service defined previously uses `schedulePrayerAlarm`. 
    // Adapting the toggle logic:

    const toggleAlarmCorrected = async (id: string, value: boolean) => {
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
        <View style={styles.item}>
            <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>
                    {item.hour.toString().padStart(2, '0')}:{item.minute.toString().padStart(2, '0')}
                </Text>
            </View>
            <Switch
                trackColor={{ false: '#e2e8f0', true: colors.primary.light }}
                thumbColor={item.enabled ? colors.primary.main : '#f4f3f4'}
                onValueChange={(val) => toggleAlarmCorrected(item.id, val)}
                value={item.enabled}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Prayer Alarms', headerBackTitle: 'Settings' }} />
            <View style={styles.header}>
                <Ionicons name="notifications" size={48} color={colors.primary.main} />
                <Text style={styles.headerTitle}>Daily Prayer Reminders</Text>
                <Text style={styles.headerSubtitle}>
                    Get notified for the 7 canonical hours of prayer.
                </Text>
            </View>
            <FlatList
                data={alarms}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 12,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 4,
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
        color: '#334155',
    },
    itemSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 2,
        fontVariant: ['tabular-nums'],
    },
});
