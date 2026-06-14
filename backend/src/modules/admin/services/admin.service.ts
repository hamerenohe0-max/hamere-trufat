import { Injectable } from '@nestjs/common';
import { NewsService } from '../../news/services/news.service';
import { ArticlesService } from '../../articles/services/articles.service';
import { EventsService } from '../../events/services/events.service';
import { FeastsService } from '../../feasts/services/feasts.service';
import { ProgressService } from '../../progress/services/progress.service';
import { UsersService } from '../../users/services/users.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { MediaService } from '../../media/services/media.service';
import { RolesService } from '../../roles/services/roles.service';

@Injectable()
export class AdminService {
  constructor(
    private newsService: NewsService,
    private articlesService: ArticlesService,
    private eventsService: EventsService,
    private feastsService: FeastsService,
    private progressService: ProgressService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private mediaService: MediaService,
    private rolesService: RolesService,
  ) {}

  async getDashboardStats() {
    const [news, articles, events, feasts, users, publishers] = await Promise.all([
      this.newsService.findAll({ limit: 1 }),
      this.articlesService.findAll({ limit: 1 }),
      this.eventsService.findAll({ limit: 1 }),
      this.feastsService.findAll({ limit: 1 }),
      this.usersService.findAll({ limit: 1 }),
      this.rolesService.findAll({ status: 'pending', limit: 1 }),
    ]);

    return {
      totalNews: news.total,
      totalArticles: articles.total,
      totalEvents: events.total,
      totalFeasts: feasts.total,
      totalUsers: users.total,
      pendingPublishers: publishers.total,
      totalViews: 0, // Calculate from aggregated views
      totalEngagement: 0, // Calculate from likes/comments
    };
  }

  async getChartData(days: number = 30) {
    // Mock implementation - in production, aggregate from views/engagement
    const data: Array<{ date: string; views: number; engagement: number }> = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500) + 200,
        engagement: Math.floor(Math.random() * 50) + 10,
      });
    }
    return data;
  }

  async getContentStats() {
    const [news, articles, events] = await Promise.all([
      this.newsService.findAll(),
      this.articlesService.findAll(),
      this.eventsService.findAll(),
    ]);

    return {
      news: {
        published: news.items.filter((n: any) => n.status === 'published').length,
        draft: news.items.filter((n: any) => n.status === 'draft').length,
      },
      articles: {
        published: articles.items.length,
        draft: 0,
      },
      events: {
        upcoming: events.items.filter((e: any) => new Date(e.start_date) > new Date()).length,
        past: events.items.filter((e: any) => new Date(e.start_date) <= new Date()).length,
      },
    };
  }

  async getAnalytics(filters?: { startDate?: string; endDate?: string }) {
    const [news, articles, events, feasts] = await Promise.all([
      this.newsService.findAll({ limit: 100 }),
      this.articlesService.findAll({ limit: 100 }),
      this.eventsService.findAll({ limit: 100 }),
      this.feastsService.findAll({ limit: 100 }),
    ]);

    const content = [
      ...news.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: 'news' as const,
        views: item.views || 0,
        engagement: (item.likes || 0) + (item.dislikes || 0),
        createdAt: item.created_at,
      })),
      ...articles.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: 'article' as const,
        views: item.views || 0,
        engagement: (item.likes || 0) + (item.dislikes || 0),
        createdAt: item.created_at,
      })),
      ...events.items.map((item: any) => ({
        id: item.id,
        title: item.name,
        type: 'event' as const,
        views: item.views || 0,
        engagement: item.reminder_enabled ? 1 : 0,
        createdAt: item.created_at,
      })),
      ...feasts.items.map((item: any) => ({
        id: item.id,
        title: item.name,
        type: 'feast' as const,
        views: item.views || 0,
        engagement: item.reminder_enabled ? 1 : 0,
        createdAt: item.created_at,
      })),
    ];

    const start = filters?.startDate ? new Date(filters.startDate) : undefined;
    const end = filters?.endDate ? new Date(filters.endDate) : undefined;
    const filtered = content.filter((item) => {
      if (!item.createdAt) return true;
      const createdAt = new Date(item.createdAt);
      if (start && createdAt < start) return false;
      if (end && createdAt > end) return false;
      return true;
    });

    const viewsByDate = new Map<string, number>();
    const engagementByType = new Map<string, number>();

    for (const item of filtered) {
      const date = item.createdAt
        ? new Date(item.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      viewsByDate.set(date, (viewsByDate.get(date) || 0) + item.views);
      engagementByType.set(item.type, (engagementByType.get(item.type) || 0) + item.engagement);
    }

    return {
      totalViews: filtered.reduce((sum, item) => sum + item.views, 0),
      totalEngagement: filtered.reduce((sum, item) => sum + item.engagement, 0),
      topContent: filtered
        .sort((a, b) => b.views + b.engagement - (a.views + a.engagement))
        .slice(0, 10)
        .map(({ createdAt, ...item }) => item),
      viewsByDate: Array.from(viewsByDate.entries()).map(([date, views]) => ({ date, views })),
      engagementByType: Array.from(engagementByType.entries()).map(([type, count]) => ({ type, count })),
    };
  }
}

