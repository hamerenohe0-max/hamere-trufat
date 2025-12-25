import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { newsApi, NewsItem } from "../services/news.api";

export function useNewsList() {
  return useQuery({
    queryKey: ["admin-news"],
    queryFn: newsApi.list,
  });
}

export function useNews(id: string) {
  return useQuery({
    queryKey: ["admin-news", id],
    queryFn: () => newsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (error) => {
      console.error("Failed to create news:", error);
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsItem> }) =>
      newsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (error) => {
      console.error("Failed to update news:", error);
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (error) => {
      console.error("Failed to delete news:", error);
    },
  });
}

export function usePublishNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newsApi.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (error) => {
      console.error("Failed to publish news:", error);
    },
  });
}

export function useScheduleNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publishAt }: { id: string; publishAt: string }) =>
      newsApi.schedule(id, publishAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    },
  });
}

