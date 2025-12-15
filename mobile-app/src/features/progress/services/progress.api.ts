import { apiFetch } from '../../../services/api';
import { ProgressReport } from '../../../types/models';
import { mockProgressReports } from '../../../data/mock-progress';

// Mock progress API - will be replaced with real API later
const mockLikes: Record<string, number> = {};
const mockComments: Record<string, number> = {};

export const progressApi = {
  list: async (): Promise<ProgressReport[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockProgressReports.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      title: p.title,
      summary: p.description,
      pdfUrl: p.pdfUrl,
      beforeImage: p.beforeImages?.[0],
      afterImage: p.afterImages?.[0],
      timeline: p.timeline.map((t) => ({
        label: t.title,
        description: t.description,
        date: t.date,
      })),
      likes: (mockLikes[p.id] ?? 0) + p.likes,
      liked: false,
      commentsCount: (mockComments[p.id] ?? 0) + p.comments,
    }));
  },
  detail: async (id: string): Promise<ProgressReport> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const p = mockProgressReports.find((r) => r.id === id);
    if (!p) throw new Error('Progress report not found');

    return {
      id: p.id,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      title: p.title,
      summary: p.description,
      pdfUrl: p.pdfUrl,
      beforeImage: p.beforeImages?.[0],
      afterImage: p.afterImages?.[0],
      timeline: p.timeline.map((t) => ({
        label: t.title,
        description: t.description,
        date: t.date,
      })),
      likes: (mockLikes[p.id] ?? 0) + p.likes,
      liked: false,
      commentsCount: (mockComments[p.id] ?? 0) + p.comments,
    };
  },
  like: async (id: string): Promise<{ likes: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const current = mockLikes[id] ?? 0;
    mockLikes[id] = current + 1;
    const p = mockProgressReports.find((r) => r.id === id);
    return { likes: mockLikes[id] + (p?.likes ?? 0) };
  },
  comment: async (id: string, body: string): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = mockComments[id] ?? 0;
    mockComments[id] = current + 1;
    return { success: true };
  },
};


