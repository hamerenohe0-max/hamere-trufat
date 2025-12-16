import { apiFetch } from "@/lib/api";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  authorId: string;
  publishedAt?: string;
  status: "draft" | "scheduled" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const newsApi = {
  list: () => apiFetch<PaginatedResponse<NewsItem>>("/admin/news"),
  get: (id: string) => apiFetch<NewsItem>(`/admin/news/${id}`),
  create: (data: Omit<NewsItem, "id" | "createdAt" | "updatedAt">) =>
    apiFetch<NewsItem>("/admin/news", { method: "POST", body: data }),
  update: (id: string, data: Partial<NewsItem>) =>
    apiFetch<NewsItem>(`/admin/news/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/news/${id}`, { method: "DELETE" }),
  publish: (id: string) =>
    apiFetch<NewsItem>(`/admin/news/${id}/publish`, { method: "POST" }),
  schedule: (id: string, publishAt: string) =>
    apiFetch<NewsItem>(`/admin/news/${id}/schedule`, {
      method: "POST",
      body: { publishAt },
    }),
};

