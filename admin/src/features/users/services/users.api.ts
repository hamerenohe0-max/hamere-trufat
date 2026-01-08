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
  profile?: {
    bio?: string;
    avatarUrl?: string;
    language?: string;
    region?: string;
    phone?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const usersApi = {
  list: (filters?: { role?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return apiFetch<PaginatedResponse<User>>(`/admin/users${query ? `?${query}` : ''}`);
  },
  get: (id: string) => apiFetch<User>(`/admin/users/${id}`),
  getPublishers: (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return apiFetch<PaginatedResponse<User>>(`/admin/publishers${query ? `?${query}` : ''}`);
  },
  update: (id: string, data: Partial<User> & { 
    bio?: string; 
    phone?: string; 
    region?: string; 
    language?: string; 
    avatarUrl?: string; 
  }) =>
    apiFetch<User>(`/admin/users/${id}`, { 
      method: "PATCH", 
      body: JSON.stringify(data) 
    }),
  suspend: (id: string) =>
    apiFetch<User>(`/admin/users/${id}/suspend`, { method: "POST" }),
  activate: (id: string) =>
    apiFetch<User>(`/admin/users/${id}/activate`, { method: "POST" }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/users/${id}`, { method: "DELETE" }),
};

