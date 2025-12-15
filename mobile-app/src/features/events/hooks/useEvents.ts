import { useMutation, useQuery } from '@tanstack/react-query';
import { eventsApi } from '../services/events.api';

export const useEvents = () =>
  useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.list,
  });

export const useEventDetail = (id: string) =>
  useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.detail(id),
    enabled: !!id,
  });

export const useEventReminder = (id: string) =>
  useMutation({
    mutationFn: (enabled: boolean) => eventsApi.reminder(id, enabled),
  });


