import { apiFetch } from '../../../services/api';
import { SpiritualArticle, Author } from '../../../types/models';
import { mockArticles } from '../../../data/mock-articles';
import { mockAuthors } from '../../../data/mock-data';

// Mock articles API - will be replaced with real API later
const mockBookmarks: Record<string, boolean> = {};

export const articlesApi = {
  list: async (): Promise<SpiritualArticle[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockArticles.map((a) => {
      const author = mockAuthors.find((auth) => auth.id === a.authorId);
      return {
        ...a,
        excerpt: a.content.substring(0, 200) + '...',
        readingTime: `${Math.ceil(a.content.length / 500)} min`,
        author: author
          ? {
              id: author.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              name: author.name,
              avatarUrl: author.avatarUrl,
              bio: author.bio,
            }
          : undefined,
        keywords: ['spiritual', 'orthodox', 'faith'],
        bookmarked: mockBookmarks[a.id] ?? false,
      };
    });
  },
  detail: async (id: string): Promise<SpiritualArticle> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const article = mockArticles.find((a) => a.id === id);
    if (!article) throw new Error('Article not found');

    const author = mockAuthors.find((auth) => auth.id === article.authorId);
    return {
      ...article,
      excerpt: article.content.substring(0, 200) + '...',
      readingTime: `${Math.ceil(article.content.length / 500)} min`,
      author: author
        ? {
            id: author.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: author.name,
            avatarUrl: author.avatarUrl,
            bio: author.bio,
          }
        : undefined,
      keywords: ['spiritual', 'orthodox', 'faith'],
      bookmarked: mockBookmarks[id] ?? false,
    };
  },
  author: async (id: string): Promise<Author> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const author = mockAuthors.find((a) => a.id === id);
    if (!author) throw new Error('Author not found');

    return {
      id: author.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: author.name,
      avatarUrl: author.avatarUrl,
      bio: author.bio,
      title: 'Spiritual Writer',
      followers: Math.floor(Math.random() * 1000) + 100,
      articlesCount: mockArticles.filter((a) => a.authorId === id).length,
    };
  },
  articlesByAuthor: async (id: string): Promise<SpiritualArticle[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const authorArticles = mockArticles.filter((a) => a.authorId === id);
    const author = mockAuthors.find((a) => a.id === id);

    return authorArticles.map((a) => ({
      ...a,
      excerpt: a.content.substring(0, 200) + '...',
      readingTime: `${Math.ceil(a.content.length / 500)} min`,
      author: author
        ? {
            id: author.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: author.name,
            avatarUrl: author.avatarUrl,
            bio: author.bio,
          }
        : undefined,
      keywords: ['spiritual', 'orthodox', 'faith'],
      bookmarked: mockBookmarks[a.id] ?? false,
    }));
  },
  bookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    mockBookmarks[id] = !mockBookmarks[id];
    return { bookmarked: mockBookmarks[id] ?? false };
  },
};


