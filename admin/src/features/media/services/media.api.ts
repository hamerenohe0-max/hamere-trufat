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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const mediaApi = {
  list: async () => {
    const response = await apiFetch<PaginatedResponse<any>>("/admin/media");
    return {
      ...response,
      items: response.items.map(mapMediaItem),
    } as PaginatedResponse<MediaItem>;
  },
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<any>("/admin/media/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }).then(mapMediaItem);
  },
  delete: (id: string) =>
    apiFetch<void>(`/admin/media/${id}`, { method: "DELETE" }),
};

function mapMediaItem(item: any): MediaItem {
  return {
    id: item.id,
    filename: item.filename,
    url: item.url,
    type: item.type,
    size: item.size,
    uploadedAt: item.uploadedAt || item.created_at || item.uploaded_at,
    uploadedBy: item.uploadedBy || item.uploaded_by,
  };
}

