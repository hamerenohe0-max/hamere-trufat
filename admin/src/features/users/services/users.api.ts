import { apiFetch } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "publisher" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export const usersApi = {
  list: () => apiFetch<User[]>("/admin/users"),
  get: (id: string) => apiFetch<User>(`/admin/users/${id}`),
  update: (id: string, data: Partial<User>) =>
    apiFetch<User>(`/admin/users/${id}`, { method: "PATCH", body: data }),
  suspend: (id: string) =>
    apiFetch<User>(`/admin/users/${id}/suspend`, { method: "POST" }),
  activate: (id: string) =>
    apiFetch<User>(`/admin/users/${id}/activate`, { method: "POST" }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/users/${id}`, { method: "DELETE" }),
};

