"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardCharts, useContentStats } from "../hooks/useDashboard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function DashboardCharts() {
  const { data: chartData, isLoading: chartsLoading } = useDashboardCharts(30);
  const { data: contentStats, isLoading: contentLoading } = useContentStats();

  // Mock data for development
  const mockChartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.floor(Math.random() * 500) + 200,
      engagement: Math.floor(Math.random() * 50) + 10,
    };
  });

  const mockContentStats = {
    news: { published: 42, draft: 3 },
    articles: { published: 20, draft: 3 },
    events: { upcoming: 8, past: 4 },
  };

  const charts = chartData || mockChartData;
  const stats = contentStats || mockContentStats;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Views & Engagement (Last 30 Days)</CardTitle>
          <CardDescription>Daily views and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {chartsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#2563eb" name="Views" />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Status</CardTitle>
          <CardDescription>Published vs draft content</CardDescription>
        </CardHeader>
        <CardContent>
          {contentLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading content stats...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "News", Published: stats.news.published, Draft: stats.news.draft },
                { name: "Articles", Published: stats.articles.published, Draft: stats.articles.draft },
                { name: "Events", Upcoming: stats.events.upcoming, Past: stats.events.past },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Published" fill="#2563eb" />
                <Bar dataKey="Draft" fill="#94a3b8" />
                <Bar dataKey="Upcoming" fill="#10b981" />
                <Bar dataKey="Past" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

