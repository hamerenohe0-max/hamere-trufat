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
        published: news.items.filter((n) => n.status === 'published').length,
        draft: news.items.filter((n) => n.status === 'draft').length,
      },
      articles: {
        published: articles.items.length,
        draft: 0,
      },
      events: {
        upcoming: events.items.filter((e) => new Date(e.startDate) > new Date()).length,
        past: events.items.filter((e) => new Date(e.startDate) <= new Date()).length,
      },
    };
  }
}

