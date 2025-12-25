import { apiFetch } from "@/lib/api";

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  images?: string[];
  author_id: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views: number;
}

export interface CreateArticleDto {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  keywords?: string[]; // Renamed from tags to match backend DTO
}

export const articlesApi = {
  list: () => apiFetch<{ items: ArticleItem[] }>("/articles"),
  
  get: (id: string) => apiFetch<ArticleItem>(`/articles/${id}`),
  
  create: (data: CreateArticleDto) =>
    apiFetch<ArticleItem>("/articles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<CreateArticleDto>) =>
    apiFetch<ArticleItem>(`/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) =>
    apiFetch<void>(`/articles/${id}`, {
      method: "DELETE",
    }),
};
