import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboard.api';
import { DashboardSummary } from '../../../types/models';

export function useDashboardSummary(
  options?: UseQueryOptions<DashboardSummary>,
) {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.fetchSummary,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}


