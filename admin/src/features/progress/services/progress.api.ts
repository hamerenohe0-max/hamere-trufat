import { apiFetch } from "@/lib/api";

export interface ProgressCustomEvent {
  date: string;
  title: string;
  description: string;
}

export interface ProgressItem {
  id: string;
  title: string;
  summary: string;
  pdf_url?: string;
  before_image?: string;
  after_image?: string;
  media_gallery: string[];
  timeline: ProgressCustomEvent[];
  likes: number;
  comments_count: number;
  created_at: string;
}

export interface CreateProgressDto {
  title: string;
  summary: string;
  pdfUrl?: string;
  beforeImage?: string;
  afterImage?: string;
  mediaGallery?: string[];
  timeline?: ProgressCustomEvent[];
}

export const progressApi = {
  list: () => apiFetch<{ items: ProgressItem[] }>("/progress"),
  get: (id: string) => apiFetch<ProgressItem>(`/progress/${id}`),
  create: (data: CreateProgressDto) =>
    apiFetch<ProgressItem>("/progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateProgressDto>) =>
    apiFetch<ProgressItem>(`/progress/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/progress/${id}`, {
      method: "DELETE",
    }),
};
