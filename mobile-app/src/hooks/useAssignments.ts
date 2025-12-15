import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => apiFetch('/assignments'),
  });
}
