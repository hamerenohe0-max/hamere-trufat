import { apiFetch } from '../../../services/api';
import { NewsDetail, NewsItem, NewsComment } from '../../../types/models';
import { mockNews } from '../../../data/mock-news';

// Mock news API - will be replaced with real API later
const mockComments: Record<string, NewsComment[]> = {
  'news-1': [
    {
      id: 'comment-1',
      createdAt: '2025-11-18T17:00:00Z',
      updatedAt: '2025-11-18T17:00:00Z',
      user: {
        id: 'user-1',
        name: 'Sol Hn',
        avatarUrl: 'https://via.placeholder.com/150',
      },
      body: 'Great news! Looking forward to more updates.',
      likes: 5,
      liked: false,
    },
  ],
};

const mockReactions: Record<string, { likes: number; dislikes: number }> = {
  'news-1': { likes: 12, dislikes: 0 },
  'news-2': { likes: 8, dislikes: 1 },
  'news-3': { likes: 15, dislikes: 0 },
};

export const newsApi = {
  list: async (): Promise<NewsItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockNews;
  },
  detail: async (id: string): Promise<NewsDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const news = mockNews.find((n) => n.id === id);
    if (!news) throw new Error('News not found');

    const reactions = mockReactions[id] || { likes: 0, dislikes: 0 };
    const related = mockNews.filter((n) => n.id !== id).slice(0, 3);

    return {
      ...news,
      content: news.body,
      comments: mockComments[id] || [],
      reactions: {
        ...reactions,
        userReaction: null,
      },
      related,
      bookmarked: false,
      language: 'am',
    };
  },
  comments: async (id: string): Promise<NewsComment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockComments[id] || [];
  },
  react: async (
    id: string,
    value: 'like' | 'dislike',
  ): Promise<{ likes: number; dislikes: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const current = mockReactions[id] || { likes: 0, dislikes: 0 };
    if (value === 'like') {
      mockReactions[id] = { likes: current.likes + 1, dislikes: current.dislikes };
    } else {
      mockReactions[id] = { likes: current.likes, dislikes: current.dislikes + 1 };
    }
    return mockReactions[id];
  },
  bookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { bookmarked: true };
  },
  addComment: async (id: string, body: string): Promise<NewsComment> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const comment: NewsComment = {
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user-current',
        name: 'You',
        avatarUrl: 'https://via.placeholder.com/150',
      },
      body,
      likes: 0,
      liked: false,
    };
    if (!mockComments[id]) mockComments[id] = [];
    mockComments[id].push(comment);
    return comment;
  },
  translate: async (
    id: string,
    lang: string,
  ): Promise<{ language: string; body: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const news = mockNews.find((n) => n.id === id);
    if (!news) throw new Error('News not found');
    // Mock translation - in real app, this would call Google Translate API
    return {
      language: lang,
      body: `[Translated to ${lang}] ${news.body}`,
    };
  },
  related: async (id: string): Promise<NewsItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockNews.filter((n) => n.id !== id).slice(0, 3);
  },
};


