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

export const rolesApi = {
  getPublisherRequests: () =>
    apiFetch<PublisherRequest[]>("/admin/publishers/requests"),
  approvePublisher: (id: string) =>
    apiFetch<void>(`/admin/publishers/${id}/approve`, { method: "POST" }),
  rejectPublisher: (id: string) =>
    apiFetch<void>(`/admin/publishers/${id}/reject`, { method: "POST" }),
};

