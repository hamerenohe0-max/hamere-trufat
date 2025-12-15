import { useMutation, useQuery } from '@tanstack/react-query';
import { feastsApi } from '../services/feasts.api';

export const useFeasts = () =>
  useQuery({
    queryKey: ['feasts'],
    queryFn: feastsApi.list,
  });

export const useFeastDetail = (id: string) =>
  useQuery({
    queryKey: ['feasts', id],
    queryFn: () => feastsApi.detail(id),
    enabled: !!id,
  });

export const useFeastReminder = (id: string) =>
  useMutation({
    mutationFn: (enabled: boolean) => feastsApi.reminder(id, enabled),
  });

