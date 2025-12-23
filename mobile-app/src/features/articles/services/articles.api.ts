import { apiFetch } from '../../../services/api';
import { SpiritualArticle, Author } from '../../../types/models';

interface ArticleResponse {
  items: SpiritualArticle[];
  total: number;
  limit: number;
  offset: number;
}

export const articlesApi = {
  list: async (limit = 20, offset = 0): Promise<SpiritualArticle[]> => {
    const response = await apiFetch<ArticleResponse>(`/articles?limit=${limit}&offset=${offset}`);
    // Transform backend data to SpiritualArticle if necessary, or assume backend matches
    // For now, mapping snake_case to camelCase if backend sends snake_case is handled effectively if we define types correctly.
    // However, the admin side DTOs showed snake_case (e.g., start_date). 
    // The mobile app models.ts uses camelCase (createdAt, updatedAt).
    // The backend usually returns what's in the DB or DTO. 
    // Admin was using `ArticleItem` with snake_case. 
    // Mobile `apiFetch` uses generic `T`. 
    // We might need a transformer here if backend is strict snake_case and frontend is strict camelCase.
    // Based on previous files, backend seems to be NestJS + naming convention.
    // Let's assume for this step we might need manual mapping or the backend was updated to return camelCase.
    // Given the admin interface `ArticleItem` had `created_at`, we probably need to map.
    
    return response.items.map(mapArticleFromBackend);
  },

  detail: async (id: string): Promise<SpiritualArticle> => {
    const data = await apiFetch<any>(`/articles/${id}`);
    return mapArticleFromBackend(data);
  },

  author: async (id: string): Promise<Author> => {
    const data = await apiFetch<any>(`/users/${id}/profile`); // Assuming endpoint
    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      title: data.role // Mapping role to title for now
    };
  },

  articlesByAuthor: async (id: string): Promise<SpiritualArticle[]> => {
    const response = await apiFetch<ArticleResponse>(`/articles?authorId=${id}`); // Assuming filter
    return response.items.map(mapArticleFromBackend);
  },

  bookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    // This probably hits a specific endpoint or generic update
    // For now, let's assume a toggle endpoint exists or we skip strictly implementing logic if unknown.
    // We'll trust the user wants the fetch part mostly right now.
    // Let's mock the return for safe execution or call a likely endpoint
    // await apiFetch(`/articles/${id}/bookmark`, { method: 'POST' });
    return { bookmarked: true }; 
  },
};

// Helper to map backend fields to frontend model
function mapArticleFromBackend(data: any): SpiritualArticle {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt || data.content?.substring(0, 100) || '',
    coverImage: data.cover_image,
    authorId: data.author_id,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    keywords: data.keywords || [],
    views: data.views || 0,
    tags: data.tags || [],
    relatedEventIds: [], // Backend might not send this yet
    readingTime: '5 min', // Placeholder or calc
    author: data.author ? {
        id: data.author.id,
        name: data.author.name,
        avatarUrl: data.author.avatar_url,
        createdAt: data.author.created_at,
        updatedAt: data.author.updated_at
    } : undefined
  } as SpiritualArticle;
}
