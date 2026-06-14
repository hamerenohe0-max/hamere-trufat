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
      return fetchApiSummary();
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
          readingTime: `${Math.max(1, Math.ceil((mockArticles[0].content?.split(/\s+/)?.length || 0) / 200))} min`,
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
  refreshQuickLinks: async () => ({ links: quickLinks }),
};

const quickLinks: DashboardSummary['quickLinks'] = [
  { label: 'Daily Readings', icon: 'book', href: '/(protected)/readings' },
  { label: 'Events', icon: 'calendar', href: '/(protected)/events' },
  { label: 'Feasts', icon: 'star', href: '/(protected)/feasts' },
  { label: 'Articles', icon: 'document-text', href: '/(protected)/articles' },
  { label: 'Games', icon: 'game-controller', href: '/(protected)/games' },
  { label: 'Settings', icon: 'settings', href: '/(protected)/settings' },
];

async function fetchApiSummary(): Promise<DashboardSummary> {
  const today = new Date().toISOString().split('T')[0];
  const [reading, news, progress, articles, events] = await Promise.all([
    apiFetch<any>('/readings/today', { auth: false }),
    apiFetch<{ items: any[] }>('/news?status=published&limit=3&offset=0', { auth: false }),
    apiFetch<{ items: any[] }>('/progress?limit=2&offset=0', { auth: false }),
    apiFetch<{ items: any[] }>('/articles?limit=1&offset=0', { auth: false }),
    apiFetch<{ items: any[] }>('/events?limit=5&offset=0', { auth: false }),
  ]);

  const upcomingEvent = events.items.find((event) => new Date(event.start_date) > new Date());
  const featuredArticle = articles.items[0];

  return {
    date: today,
    dailyGospel: {
      title: reading?.gospel?.title || reading?.gospel?.book || 'Daily Reading',
      reference: reading?.gospel?.reference || '',
      body: reading?.gospel?.body || reading?.gospel?.text || '',
    },
    latestNews: news.items.map((item) => ({
      id: item.id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      title: item.title,
      summary: item.summary,
      body: item.body,
      tags: item.tags || [],
      images: item.images || (item.cover_image ? [item.cover_image] : []),
      authorId: item.author_id,
      publishedAt: item.published_at,
      status: item.status,
    })),
    progressReports: progress.items.map((item) => ({
      id: item.id,
      createdAt: item.created_at,
      updatedAt: item.updated_at || item.created_at,
      title: item.title,
      summary: item.summary,
      pdfUrl: item.pdf_url,
      beforeImage: item.before_image,
      afterImage: item.after_image,
      mediaGallery: item.media_gallery || [],
      timeline: (item.timeline || []).map((event: any) => ({
        label: event.label || event.title,
        description: event.description,
        date: event.date,
      })),
      likes: item.likes || 0,
      commentsCount: item.comments_count || 0,
    })),
    featuredArticle: featuredArticle
      ? {
        id: featuredArticle.id,
        createdAt: featuredArticle.created_at,
        updatedAt: featuredArticle.updated_at,
        title: featuredArticle.title,
        slug: featuredArticle.slug,
        content: featuredArticle.content,
        excerpt: featuredArticle.excerpt || '',
        coverImage: featuredArticle.cover_image,
        images: featuredArticle.images || [],
        authorId: featuredArticle.author_id,
        publishedAt: featuredArticle.published_at,
        relatedEventIds: featuredArticle.related_event_ids || [],
        readingTime: featuredArticle.reading_time || '1 min',
        keywords: featuredArticle.keywords || [],
      }
      : undefined,
    upcomingEvent: upcomingEvent
      ? {
        id: upcomingEvent.id,
        createdAt: upcomingEvent.created_at,
        updatedAt: upcomingEvent.updated_at || upcomingEvent.created_at,
        name: upcomingEvent.name,
        description: upcomingEvent.description,
        startDate: upcomingEvent.start_date,
        endDate: upcomingEvent.end_date,
        location: upcomingEvent.location,
        featured: upcomingEvent.featured,
        coordinates: upcomingEvent.coordinates,
        flyerImages: upcomingEvent.flyer_images || [],
        reminderEnabled: upcomingEvent.reminder_enabled,
      }
      : undefined,
    quickLinks,
  };
}

