import { apiFetch } from '../../../services/api';
import { NewsDetail, NewsItem, NewsComment } from '../../../types/models';

interface NewsResponse {
  items: any[];
  total: number;
}

export const newsApi = {
  list: async (limit = 20, offset = 0): Promise<NewsItem[]> => {
    const response = await apiFetch<NewsResponse>(`/news?limit=${limit}&offset=${offset}`);
    return response.items.map(mapNewsFromBackend);
  },

  detail: async (id: string): Promise<NewsDetail> => {
    const data = await apiFetch<any>(`/news/${id}`);
    const base = mapNewsFromBackend(data);
    return {
      ...base,
      content: data.body, // Assuming body is the content
      comments: [], // Needs separate fetch or backend inclusion
      reactions: { likes: 0, dislikes: 0 },
      related: [],
      bookmarked: false,
    };
  },

  comments: async (id: string): Promise<NewsComment[]> => {
    const response = await apiFetch<{ items: any[] }>(`/news/${id}/comments`);
    return response.items || [];
  },

  react: async (
    id: string,
    value: 'like' | 'dislike',
  ): Promise<{ likes: number; dislikes: number }> => {
    return apiFetch(`/news/${id}/react`, {
      method: 'POST',
      body: { reaction: value },
    });
  },

  bookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    return apiFetch(`/news/${id}/bookmark`, { method: 'POST' });
  },

  addComment: async (id: string, body: string): Promise<NewsComment> => {
    return apiFetch<NewsComment>(`/news/${id}/comments`, {
      method: 'POST',
      body: { body },
    });
  },

  translate: async (
    id: string,
    lang: string,
  ): Promise<{ language: string; body: string }> => {
    // Helper functionality - backend support pending, mocking for now or implement if backend exists
    return { language: lang, body: 'Translation not implemented on backend yet.' };
  },

  related: async (id: string): Promise<NewsItem[]> => {
     // Optional: Implement if backend supports related news
    return [];
  },
};

function mapNewsFromBackend(data: any): NewsItem {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    body: data.body,
    tags: data.tags || [],
    authorId: data.author_id,
    status: data.status,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
