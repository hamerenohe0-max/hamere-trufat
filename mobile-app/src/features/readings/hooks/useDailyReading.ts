import { useMutation, useQuery } from '@tanstack/react-query';
import { readingsApi } from '../services/readings.api';

export const useDailyReading = (date: string) =>
  useQuery({
    queryKey: ['reading', date],
    queryFn: () => readingsApi.getByDate(date),
    enabled: !!date,
  });

export const useReadingReminder = () =>
  useMutation({
    mutationFn: ({ date, enabled }: { date: string; enabled: boolean }) =>
      readingsApi.reminder(date, enabled),
  });


