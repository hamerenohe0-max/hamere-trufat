import { apiFetch } from '../../../services/api';
import { Feast } from '../../../types/models';

export const feastsApi = {
  list: async (): Promise<Feast[]> => {
    const response = await apiFetch<{ items: any[] }>('/feasts', {
      auth: false,
    });
    return response.items.map(mapFeastFromBackend);
  },

  detail: async (id: string): Promise<Feast> => {
    const data = await apiFetch<any>(`/feasts/${id}`, {
      auth: false,
    });
    return mapFeastFromBackend(data);
  },

  reminder: async (
    id: string,
    enabled: boolean,
  ): Promise<{ reminderEnabled: boolean }> => {
    const data = await apiFetch<any>(`/feasts/${id}/reminder`, {
      method: 'POST',
    });
    return { reminderEnabled: data.reminder_enabled ?? enabled };
  },
};

function mapFeastFromBackend(data: any): Feast {
  return {
    id: data.id,
    name: data.name,
    date: data.date,
    region: data.region,
    description: data.description,
    icon: data.icon,
    articleIds: data.article_ids || [],
    biography: data.biography,
    traditions: data.traditions || [],
    readings: data.readings || [],
    prayers: data.prayers || [],
    reminderEnabled: data.reminder_enabled || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

