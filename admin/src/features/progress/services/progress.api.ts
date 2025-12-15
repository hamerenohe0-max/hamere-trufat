import { apiFetch } from "@/lib/api";

export interface ProgressReport {
  id: string;
  title: string;
  summary: string;
  pdfUrl?: string;
  beforeImage?: string;
  afterImage?: string;
  timeline: Array<{
    label: string;
    description: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const progressApi = {
  list: () => apiFetch<ProgressReport[]>("/admin/progress"),
  get: (id: string) => apiFetch<ProgressReport>(`/admin/progress/${id}`),
  create: (data: Omit<ProgressReport, "id" | "createdAt" | "updatedAt">) =>
    apiFetch<ProgressReport>("/admin/progress", { method: "POST", body: data }),
  update: (id: string, data: Partial<ProgressReport>) =>
    apiFetch<ProgressReport>(`/admin/progress/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/progress/${id}`, { method: "DELETE" }),
};

