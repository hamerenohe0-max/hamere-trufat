import { apiFetch } from "@/lib/api";

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video" | "document" | "audio";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export const mediaApi = {
  list: () => apiFetch<MediaItem[]>("/admin/media"),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<MediaItem>("/admin/media/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
  delete: (id: string) =>
    apiFetch<void>(`/admin/media/${id}`, { method: "DELETE" }),
};

