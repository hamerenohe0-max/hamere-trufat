import { useMutation, useQuery } from '@tanstack/react-query';
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

export const useNewsComments = (id: string) =>
  useQuery({
    queryKey: ['news', id, 'comments'],
    queryFn: () => newsApi.comments(id),
    enabled: !!id,
  });

export const useReactToNews = (id: string) =>
  useMutation({
    mutationFn: (reaction: 'like' | 'dislike') =>
      newsApi.react(id, reaction),
  });

export const useBookmarkNews = (id: string) =>
  useMutation({
    mutationFn: () => newsApi.bookmark(id),
  });

export const useTranslateNews = (id: string) =>
  useMutation({
    mutationFn: (language: string) => newsApi.translate(id, language),
  });

export const useAddNewsComment = (id: string) =>
  useMutation({
    mutationFn: (body: string) => newsApi.addComment(id, body),
  });


