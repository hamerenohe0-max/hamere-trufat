import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '../services/articles.api';

export const useArticlesList = () =>
  useQuery({
    queryKey: ['articles'],
    queryFn: articlesApi.list,
  });

export const useArticleDetail = (id: string) =>
  useQuery({
    queryKey: ['articles', id],
    queryFn: () => articlesApi.detail(id),
    enabled: !!id,
  });

export const useAuthorProfile = (id: string) =>
  useQuery({
    queryKey: ['authors', id],
    queryFn: () => articlesApi.author(id),
    enabled: !!id,
  });

export const useArticlesByAuthor = (id: string) =>
  useQuery({
    queryKey: ['authors', id, 'articles'],
    queryFn: () => articlesApi.articlesByAuthor(id),
    enabled: !!id,
  });

export const useReactToArticle = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: 'like' | 'dislike') => articlesApi.react(id, value),
    onSuccess: (data) => {
      // Update the cache optimistically
      queryClient.setQueryData(['articles', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          reactions: {
            likes: data.likes,
            dislikes: data.dislikes,
            userReaction: data.userReaction,
          },
        };
      });
    },
  });
};

export const useBookmarkArticle = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => articlesApi.bookmark(id),
    onSuccess: (data) => {
      // Update the cache optimistically
      queryClient.setQueryData(['articles', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          bookmarked: data.bookmarked,
        };
      });
    },
  });
};

