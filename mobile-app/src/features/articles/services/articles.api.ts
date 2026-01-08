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
    const data = await apiFetch<any>(`/users/${id}/profile`);
    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.profile?.avatarUrl,
      bio: data.profile?.bio,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      title: data.role, // Mapping role to title
    };
  },

  articlesByAuthor: async (id: string): Promise<SpiritualArticle[]> => {
    const response = await apiFetch<ArticleResponse>(`/articles?authorId=${id}`); // Assuming filter
    return response.items.map(mapArticleFromBackend);
  },

  react: async (
    id: string,
    value: 'like' | 'dislike',
  ): Promise<{ likes: number; dislikes: number; userReaction: 'like' | 'dislike' | null }> => {
    return apiFetch(`/articles/${id}/reactions`, {
      method: 'POST',
      body: { reaction: value },
      auth: true,
    });
  },

  bookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    return apiFetch(`/articles/${id}/bookmark`, {
      method: 'POST',
      auth: true,
    });
  },
};

// Helper to map backend fields to frontend model
// Helper to map backend fields to frontend model
function mapArticleFromBackend(data: any): SpiritualArticle {
  // Get images array or fallback to cover_image
  const images = data.images || (data.cover_image ? [data.cover_image] : []);

  // Extract author profile data, handling both regular profile and joined publishers table
  let authorProfile = data.author?.profile || {};
  if (data.author?.role === 'publisher' && data.author?.publishers) {
    const pubData = Array.isArray(data.author.publishers) ? data.author.publishers[0] : data.author.publishers;
    if (pubData) {
      authorProfile = { ...authorProfile, avatarUrl: pubData.avatar_url, bio: pubData.bio };
    }
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt || data.content?.substring(0, 100) || '',
    coverImage: data.cover_image || (images.length > 0 ? images[0] : undefined),
    images: images,
    authorId: data.author_id,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    keywords: data.keywords || [],
    views: data.views || 0,
    tags: data.tags || [],
    relatedEventIds: [], // Backend might not send this yet
    readingTime: '5 min', // Placeholder or calc
    bookmarked: data.bookmarked || false,
    reactions: data.reactions || { likes: data.likes || 0, dislikes: data.dislikes || 0, userReaction: null },
    author: data.author ? {
      id: data.author.id,
      name: data.author.name,
      avatarUrl: authorProfile.avatarUrl,
      bio: authorProfile.bio,
      title: data.author.role,
      createdAt: data.author.created_at || data.created_at,
      updatedAt: data.author.updated_at || data.updated_at,
    } : undefined
  } as SpiritualArticle;
}
