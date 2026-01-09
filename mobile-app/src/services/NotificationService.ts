import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export interface PrayerAlarm {
    id: string;
    title: string;
    hour: number;
    minute: number;
    enabled: boolean;
}

export const DEFAULT_PRAYER_ALARMS: PrayerAlarm[] = [
    { id: 'negh', title: 'Negh (Morning)', hour: 6, minute: 0, enabled: false },
    { id: 'selest', title: 'Selest (3rd Hour)', hour: 9, minute: 0, enabled: false },
    { id: 'scdest', title: 'Scdest (6th Hour)', hour: 12, minute: 0, enabled: false },
    { id: 'teseat', title: 'Teseat (9th Hour)', hour: 15, minute: 0, enabled: false },
    { id: 'serk', title: 'Serk (Vespers)', hour: 18, minute: 0, enabled: false },
    { id: 'neven', title: 'Neven (Compline)', hour: 21, minute: 0, enabled: false },
    { id: 'lelit', title: 'Lelit (Midnight)', hour: 0, minute: 0, enabled: false },
];

export const NotificationService = {
    registerForPushNotificationsAsync: async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
    },

    schedulePrayerAlarm: async (alarm: PrayerAlarm) => {
        // Cancel existing alarm with this ID (if we used consistent IDs, but Expo uses random strings)
        // For simplicity, we'll cancel all matching this title content via logic if needed, 
        // but here we will just schedule.
        // Ideally, we store the notification ID returned.

        // For this simple implementation, we assume we just schedule based on time.

        const trigger = {
            hour: alarm.hour,
            minute: alarm.minute,
            repeats: true,
        };

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Prayer Time",
                body: `It's time for ${alarm.title}`,
                sound: true,
            },
            trigger,
        });

        return id;
    },

    cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
