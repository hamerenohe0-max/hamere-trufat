import { apiFetch } from "@/lib/api";

export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  description?: string;
  feastId?: string;
  featured: boolean;
  coordinates?: { lat: number; lng: number };
  flyerImages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const eventsApi = {
  list: () => apiFetch<PaginatedResponse<Event>>("/admin/events"),
  get: (id: string) => apiFetch<Event>(`/admin/events/${id}`),
  create: (data: Omit<Event, "id" | "createdAt" | "updatedAt">) =>
    apiFetch<Event>("/admin/events", { method: "POST", body: data }),
  update: (id: string, data: Partial<Event>) =>
    apiFetch<Event>(`/admin/events/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/events/${id}`, { method: "DELETE" }),
};

