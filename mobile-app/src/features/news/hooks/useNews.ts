import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newsApi } from '../services/news.api';

export const useNewsList = () =>
  useQuery({
    queryKey: ['news'],
    queryFn: newsApi.list,
  });

export const useNewsDetail = (id: string) =>
  useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.detail(id),
    enabled: !!id,
  });

export const useReactToNews = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reaction: 'like' | 'dislike') =>
      newsApi.react(id, reaction),
    onSuccess: (data) => {
      try {
        // Update the cache optimistically
        queryClient.setQueryData(['news', id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            reactions: {
              likes: data?.likes ?? old.reactions?.likes ?? 0,
              dislikes: data?.dislikes ?? old.reactions?.dislikes ?? 0,
              userReaction: data?.userReaction ?? null,
            },
          };
        });
      } catch (error) {
        console.error('Error updating reaction cache:', error);
      } finally {
        queryClient.invalidateQueries({ queryKey: ['news', id] });
        queryClient.invalidateQueries({ queryKey: ['news'] });
      }
    },
    onError: (error) => {
      console.error('Error reacting to news:', error);
    },
  });
};

export const useBookmarkNews = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => newsApi.bookmark(id),
    onSuccess: (data) => {
      // Update the cache optimistically
      queryClient.setQueryData(['news', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          bookmarked: data.bookmarked,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['news', id] });
    },
  });
};

export const useTranslateNews = (id: string) =>
  useMutation({
    mutationFn: (language: string) => newsApi.translate(id, language),
  });



