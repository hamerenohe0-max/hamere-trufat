import { apiFetch } from "@/lib/api";

export interface DashboardStats {
  totalNews: number;
  totalArticles: number;
  totalEvents: number;
  totalFeasts: number;
  totalUsers: number;
  pendingPublishers: number;
  totalViews: number;
  totalEngagement: number;
}

export interface ChartData {
  date: string;
  views: number;
  engagement: number;
}

export interface ContentStats {
  news: { published: number; draft: number };
  articles: { published: number; draft: number };
  events: { upcoming: number; past: number };
}

export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>("/admin/dashboard/stats"),
  getChartData: (days: number = 30) =>
    apiFetch<ChartData[]>(`/admin/dashboard/charts?days=${days}`),
  getContentStats: () => apiFetch<ContentStats>("/admin/dashboard/content"),
};

