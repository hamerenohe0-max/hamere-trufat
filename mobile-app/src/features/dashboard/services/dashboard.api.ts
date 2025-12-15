import { DashboardSummary } from '../../../types/models';
import { apiFetch } from '../../../services/api';
import { mockNews } from '../../../data/mock-news';
import { mockProgressReports } from '../../../data/mock-progress';
import { mockArticles } from '../../../data/mock-articles';
import { mockEvents } from '../../../data/mock-events';
import { mockTodaysSaint } from '../../../data/mock-data';
import { mockReadings } from '../../../data/mock-readings';

import { shouldUseMockData } from '../../../config/api.config';

// Mock dashboard summary - will be replaced with real API later
export const dashboardApi = {
  fetchSummary: async (): Promise<DashboardSummary> => {
    // If not using mock data, call real API
    if (!shouldUseMockData()) {
      return apiFetch<DashboardSummary>('/dashboard/summary', {
        method: 'GET',
      });
    }

    // Mock data implementation
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const today = new Date().toISOString().split('T')[0];
    // Find reading for today or use the most recent one
    let todayReading = mockReadings.find((r) => r.date === today);
    if (!todayReading && mockReadings.length > 0) {
      // Use the reading with the closest date to today
      todayReading = mockReadings.reduce((prev, curr) => {
        const prevDiff = Math.abs(
          new Date(prev.date).getTime() - new Date(today).getTime(),
        );
        const currDiff = Math.abs(
          new Date(curr.date).getTime() - new Date(today).getTime(),
        );
        return currDiff < prevDiff ? curr : prev;
      });
    }
    const reading = todayReading || mockReadings[0];

    return {
      date: today,
      dailyGospel: {
        title: reading.gospel.book,
        reference: `${reading.gospel.book} ${reading.gospel.chapter}:${reading.gospel.verses.join(',')}`,
        body: reading.gospel.text,
      },
      latestNews: mockNews.slice(0, 3),
      progressReports: mockProgressReports.slice(0, 2).map((p) => ({
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
        likes: p.likes,
        liked: false,
        commentsCount: p.comments,
      })),
      featuredArticle: mockArticles[0]
        ? {
            ...mockArticles[0],
            excerpt: mockArticles[0].content.substring(0, 150) + '...',
            readingTime: '5 min',
            keywords: [],
            bookmarked: false,
          }
        : undefined,
      todaysSaint: mockTodaysSaint
        ? {
            name: mockTodaysSaint.name,
            biography: mockTodaysSaint.biography,
            portraitUrl: mockTodaysSaint.icon,
          }
        : undefined,
      upcomingEvent: mockEvents.find((e) => new Date(e.startDate) > new Date()),
      quickLinks: [
        { label: 'Daily Readings', icon: '📖', href: '/(protected)/readings' },
        { label: 'Events', icon: '📅', href: '/(protected)/events' },
        { label: 'Feasts', icon: '🎉', href: '/(protected)/feasts' },
        { label: 'Articles', icon: '📝', href: '/(protected)/articles' },
        { label: 'Games', icon: '🎮', href: '/(protected)/games' },
        { label: 'Settings', icon: '⚙️', href: '/(protected)/settings' },
      ],
    };
  },
  refreshQuickLinks: () =>
    apiFetch<{ links: DashboardSummary['quickLinks'] }>(
      '/dashboard/quick-links',
    ),
};


