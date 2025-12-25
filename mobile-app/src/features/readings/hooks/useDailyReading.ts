import { useMutation, useQuery } from '@tanstack/react-query';
import { readingsApi } from '../services/readings.api';

export const useDailyReading = (date?: string) => {
  // Default to today if no date provided
  const readingDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['reading', readingDate],
    queryFn: () => readingsApi.getByDate(readingDate),
    enabled: !!readingDate,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1, // Only retry once
    retryDelay: 500, // Quick retry
  });
};

export const useReadingReminder = () =>
  useMutation({
    mutationFn: ({ date, enabled }: { date: string; enabled: boolean }) =>
      readingsApi.reminder(date, enabled),
  });


