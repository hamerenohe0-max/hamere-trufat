import { useMutation, useQuery } from '@tanstack/react-query';
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

export const useBookmarkArticle = (id: string) =>
  useMutation({
    mutationFn: () => articlesApi.bookmark(id),
  });


