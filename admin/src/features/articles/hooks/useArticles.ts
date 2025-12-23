"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { articlesApi, ArticleItem, CreateArticleDto } from "../services/articles.api";

export function useArticlesList() {
  return useQuery({
    queryKey: ["admin-articles"],
    queryFn: articlesApi.list,
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
