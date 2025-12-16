import { apiFetch } from "@/lib/api";

export interface Notification {
  id: string;
  type: "assignment" | "submission" | "news" | "system";
  title: string;
  body: string;
  targetUserIds: string[];
  sentAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const notificationsApi = {
  list: () => apiFetch<PaginatedResponse<Notification>>("/admin/notifications"),
  send: (data: {
    type: Notification["type"];
    title: string;
    body: string;
    targetUserIds?: string[];
    targetRole?: "all" | "user" | "publisher" | "admin";
  }) =>
    apiFetch<Notification>("/admin/notifications", {
      method: "POST",
      body: data,
    }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/notifications/${id}`, { method: "DELETE" }),
};

