import { useMutation, useQuery } from '@tanstack/react-query';
import { progressApi } from '../services/progress.api';

export const useProgressList = () =>
  useQuery({
    queryKey: ['progress'],
    queryFn: progressApi.list,
  });

export const useProgressDetail = (id: string) =>
  useQuery({
    queryKey: ['progress', id],
    queryFn: () => progressApi.detail(id),
    enabled: !!id,
  });

export const useLikeProgress = (id: string) =>
  useMutation({
    mutationFn: () => progressApi.like(id),
  });

export const useCommentOnProgress = (id: string) =>
  useMutation({
    mutationFn: (body: string) => progressApi.comment(id, body),
  });


