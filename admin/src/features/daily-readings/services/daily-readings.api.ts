import { apiFetch } from "@/lib/api";

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

export type CreateDailyReadingDto = Omit<DailyReading, "id" | "createdAt" | "updatedAt">;

export const dailyReadingsApi = {
    getToday: async (): Promise<DailyReading | null> => {
        return apiFetch<DailyReading>("/daily-readings/today");
    },

    getByDate: async (date: string): Promise<DailyReading | null> => {
        return apiFetch<DailyReading>(`/daily-readings/${date}`);
    },

    create: async (data: CreateDailyReadingDto): Promise<DailyReading> => {
        return apiFetch<DailyReading>("/daily-readings", {
            method: "POST",
            body: data,
        });
    },
};
