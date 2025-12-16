import { apiFetch } from "@/lib/api";

export interface PublisherRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const rolesApi = {
  getPublisherRequests: () =>
    apiFetch<PaginatedResponse<PublisherRequest>>("/admin/publishers/requests"),
  approvePublisher: (id: string) =>
    apiFetch<void>(`/admin/publishers/${id}/approve`, { method: "POST" }),
  rejectPublisher: (id: string) =>
    apiFetch<void>(`/admin/publishers/${id}/reject`, { method: "POST" }),
};

