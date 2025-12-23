"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi, CreateEventDto } from "../services/events.api";

export function useEventsList() {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: eventsApi.list,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["admin-events", id],
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventDto> }) =>
      eventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}
