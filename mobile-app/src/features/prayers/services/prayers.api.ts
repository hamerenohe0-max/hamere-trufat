import { apiFetch } from '@/services/api';

export interface DailyReading {
    id: string;
    date: string;
    gospelGeez?: string;
    gospelAmharic?: string;
    gospelAudioUrl?: string;
    epistleGeez?: string;
    epistleAmharic?: string;
    epistleAudioUrl?: string;
    psalmGeez?: string;
    psalmAmharic?: string;
    psalmAudioUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export const prayersApi = {
    getToday: async (): Promise<DailyReading | null> => {
        try {
            return await apiFetch<DailyReading>('/daily-readings/today');
        } catch (error) {
            console.error('Error fetching today\'s reading:', error);
            return null;
        }
    },

    getByDate: async (date: string): Promise<DailyReading | null> => {
        try {
            return await apiFetch<DailyReading>(`/daily-readings/${date}`);
        } catch (error) {
            console.error(`Error fetching reading for ${date}:`, error);
            return null;
        }
    },
};
