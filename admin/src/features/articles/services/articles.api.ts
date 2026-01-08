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
  author?: {
    id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
      bio?: string;
    };
  };
}

export interface CreateArticleDto {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  keywords?: string[];
  status?: 'draft' | 'published';
}

export const articlesApi = {
  list: () => apiFetch<{ items: ArticleItem[] }>("/articles/my"),
  
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
