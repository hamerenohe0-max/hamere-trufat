import { apiFetch } from "@/lib/api";

export interface Feast {
  id: string;
  name: string;
  date: string;
  region: string;
  description?: string;
  icon?: string;
  articleIds: string[];
  biography?: string;
  traditions?: string[];
  readings?: string[];
  prayers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const feastsApi = {
  list: () => apiFetch<PaginatedResponse<Feast>>("/admin/feasts"),
  get: (id: string) => apiFetch<Feast>(`/admin/feasts/${id}`),
  create: (data: Omit<Feast, "id" | "createdAt" | "updatedAt">) =>
    apiFetch<Feast>("/admin/feasts", { method: "POST", body: data }),
  update: (id: string, data: Partial<Feast>) =>
    apiFetch<Feast>(`/admin/feasts/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/feasts/${id}`, { method: "DELETE" }),
};

