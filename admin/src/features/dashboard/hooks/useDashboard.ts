import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/dashboard.api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDashboardCharts(days: number = 30) {
  return useQuery({
    queryKey: ["dashboard-charts", days],
    queryFn: () => dashboardApi.getChartData(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useContentStats() {
  return useQuery({
    queryKey: ["dashboard-content-stats"],
    queryFn: dashboardApi.getContentStats,
    staleTime: 1000 * 60 * 5,
  });
}

