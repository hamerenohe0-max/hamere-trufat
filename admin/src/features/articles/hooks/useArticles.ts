"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { articlesApi, ArticleItem, CreateArticleDto } from "../services/articles.api";
import { useAuthStore } from "@/store/auth-store";

export function useArticlesList() {
  const tokens = useAuthStore((state) => state.tokens);
  return useQuery({
    queryKey: ["admin-articles"],
    queryFn: articlesApi.list,
    enabled: !!tokens?.accessToken, // Only fetch if user is authenticated
    retry: 1, // Retry once on failure
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ["admin-articles", id],
    queryFn: () => articlesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: articlesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateArticleDto> }) =>
      articlesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: articlesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });
}
