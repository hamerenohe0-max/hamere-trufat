import { apiFetch } from '../../../services/api';
import { ProgressReport } from '../../../types/models';

export const progressApi = {
  list: async (): Promise<ProgressReport[]> => {
    const response = await apiFetch<{ items: any[] }>('/progress', {
      auth: false,
    });
    return response.items.map(mapProgressFromBackend);
  },

  detail: async (id: string): Promise<ProgressReport> => {
    const data = await apiFetch<any>(`/progress/${id}`, {
      auth: false,
    });
    return mapProgressFromBackend(data);
  },

  like: async (id: string): Promise<{ likes: number }> => {
    const data = await apiFetch<any>(`/progress/${id}/like`, {
      method: 'POST',
    });
    return { likes: data.likes || 0 };
  },

  comment: async (id: string, body: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/progress/${id}/comments`, {
      method: 'POST',
      body: { body },
    });
  },
};

function mapProgressFromBackend(data: any): ProgressReport {
  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at,
    title: data.title,
    summary: data.summary,
    pdfUrl: data.pdf_url,
    beforeImage: data.before_image,
    afterImage: data.after_image,
    mediaGallery: data.media_gallery || [],
    timeline: (data.timeline || []).map((item: any) => ({
      label: item.label || item.title,
      description: item.description,
      date: item.date,
    })),
    likes: data.likes || 0,
    liked: false,
    commentsCount: data.comments_count || 0,
  };
}

