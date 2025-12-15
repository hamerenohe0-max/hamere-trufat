"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "../hooks/useDashboard";
import { Newspaper, FileText, Calendar, CalendarDays, Users, CheckCircle, Eye, Heart } from "lucide-react";

const statIcons = {
  news: Newspaper,
  articles: FileText,
  events: Calendar,
  feasts: CalendarDays,
  users: Users,
  publishers: CheckCircle,
  views: Eye,
  engagement: Heart,
};

export function DashboardStats() {
  const { data, isLoading } = useDashboardStats();

  // Mock data for development
  const mockStats = {
    totalNews: 45,
    totalArticles: 23,
    totalEvents: 12,
    totalFeasts: 8,
    totalUsers: 156,
    pendingPublishers: 3,
    totalViews: 12450,
    totalEngagement: 892,
  };

  const stats = data || mockStats;

  const statCards = [
    { key: "news", label: "News Items", value: stats.totalNews, icon: statIcons.news },
    { key: "articles", label: "Articles", value: stats.totalArticles, icon: statIcons.articles },
    { key: "events", label: "Events", value: stats.totalEvents, icon: statIcons.events },
    { key: "feasts", label: "Feasts", value: stats.totalFeasts, icon: statIcons.feasts },
    { key: "users", label: "Users", value: stats.totalUsers, icon: statIcons.users },
    { key: "publishers", label: "Pending Publishers", value: stats.pendingPublishers, icon: statIcons.publishers },
    { key: "views", label: "Total Views", value: stats.totalViews.toLocaleString(), icon: statIcons.views },
    { key: "engagement", label: "Engagement", value: stats.totalEngagement, icon: statIcons.engagement },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

