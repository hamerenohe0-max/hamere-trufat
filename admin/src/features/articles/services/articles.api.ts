import { apiFetch } from "@/lib/api";

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  relatedEventIds: string[];
  relatedFeastIds: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const articlesApi = {
  list: () => apiFetch<PaginatedResponse<Article>>("/admin/articles"),
  get: (id: string) => apiFetch<Article>(`/admin/articles/${id}`),
  create: (data: Omit<Article, "id" | "createdAt" | "updatedAt">) =>
    apiFetch<Article>("/admin/articles", { method: "POST", body: data }),
  update: (id: string, data: Partial<Article>) =>
    apiFetch<Article>(`/admin/articles/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/articles/${id}`, { method: "DELETE" }),
};

