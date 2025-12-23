"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressApi, CreateProgressDto } from "../services/progress.api";

export function useProgressList() {
  return useQuery({
    queryKey: ["admin-progress"],
    queryFn: progressApi.list,
  });
}

export function useProgress(id: string) {
  return useQuery({
    queryKey: ["admin-progress", id],
    queryFn: () => progressApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: progressApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-progress"] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProgressDto> }) =>
      progressApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-progress"] });
    },
  });
}

export function useDeleteProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: progressApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-progress"] });
    },
  });
}
