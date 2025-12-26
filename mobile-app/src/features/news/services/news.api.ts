import { apiFetch } from '../../../services/api';
import { NewsDetail, NewsItem } from '../../../types/models';

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
    
    // Debug logging
    console.log('News detail API response:', {
      id: data.id,
      hasImages: !!data.images,
      imagesType: typeof data.images,
      imagesValue: data.images,
      hasCoverImage: !!data.cover_image,
      coverImage: data.cover_image,
    });
    
    const base = mapNewsFromBackend(data);
    
    // Ensure images are properly mapped for detail view
    let images: string[] = [];
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      images = data.images.filter((img: any) => img && typeof img === 'string' && img.trim().length > 0);
    }
    // Fallback to cover_image if images array is empty
    if (images.length === 0 && data.cover_image && typeof data.cover_image === 'string' && data.cover_image.trim().length > 0) {
      images = [data.cover_image];
    }
    
    console.log('Mapped images for detail:', images);
    
    return {
      ...base,
      images: images.length > 0 ? images : base.images, // Use mapped images or fallback to base
      coverImage: data.cover_image || base.coverImage, // Ensure coverImage is set
      content: data.body || data.content,
      reactions: { 
        likes: data.likes || 0, 
        dislikes: data.dislikes || 0,
        userReaction: data.userReaction || null,
      },
      related: [],
      bookmarked: data.bookmarked || false,
    };
  },


  react: async (
    id: string,
    value: 'like' | 'dislike',
  ): Promise<{ likes: number; dislikes: number; userReaction: 'like' | 'dislike' | null }> => {
    return apiFetch(`/news/${id}/reactions`, {
      method: 'POST',
      body: { reaction: value },
      auth: true,
    });
  },

  bookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    return apiFetch(`/news/${id}/bookmark`, { 
      method: 'POST',
      auth: true,
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
  // Get images array or fallback to cover_image for backward compatibility
  // Filter out empty/null values and ensure we have valid image URLs
  let images: string[] = [];
  
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    // Filter out null, undefined, or empty strings
    images = data.images.filter((img: any) => img && typeof img === 'string' && img.trim().length > 0);
  }
  
  // If no images in array but cover_image exists, use it
  if (images.length === 0 && data.cover_image && typeof data.cover_image === 'string' && data.cover_image.trim().length > 0) {
    images = [data.cover_image];
  }
  
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    body: data.body,
    tags: data.tags || [],
    images: images,
    authorId: data.author_id,
    status: data.status,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

