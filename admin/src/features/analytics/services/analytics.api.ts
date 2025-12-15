import { apiFetch } from "@/lib/api";

export interface AnalyticsData {
  totalViews: number;
  totalEngagement: number;
  topContent: Array<{
    id: string;
    title: string;
    type: "news" | "article" | "event" | "feast";
    views: number;
    engagement: number;
  }>;
  viewsByDate: Array<{ date: string; views: number }>;
  engagementByType: Array<{ type: string; count: number }>;
}

export const analyticsApi = {
  getAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return apiFetch<AnalyticsData>(`/admin/analytics?${params.toString()}`);
  },
};

