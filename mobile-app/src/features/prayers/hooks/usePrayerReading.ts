import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prayersApi } from '../services/prayers.api';

export function usePrayerReading(date: string) {
    return useQuery({
        queryKey: ['prayer-reading', date],
        queryFn: () => {
            // If date is today, use getToday, otherwise getByDate
            const today = new Date().toISOString().split('T')[0];
            if (date === today) {
                return prayersApi.getToday();
            }
            return prayersApi.getByDate(date);
        },
    });
}
