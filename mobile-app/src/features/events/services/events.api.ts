import { apiFetch } from '../../../services/api';
import { Event } from '../../../types/models';

interface EventsResponse {
  items: any[];
  total: number;
}

export const eventsApi = {
  list: async (): Promise<Event[]> => {
    const response = await apiFetch<EventsResponse>('/events');
    return response.items.map(mapEventFromBackend);
  },

  detail: async (id: string): Promise<Event> => {
    const data = await apiFetch<any>(`/events/${id}`);
    return mapEventFromBackend(data);
  },

  reminder: async (
    id: string,
    enabled: boolean,
  ): Promise<{ reminderEnabled: boolean }> => {
    // Assuming endpoint for toggling reminder
    // await apiFetch(`/events/${id}/reminder`, { method: 'POST', body: { enabled } });
    return { reminderEnabled: enabled };
  },
};

function mapEventFromBackend(data: any): Event {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    location: data.location,
    featured: data.featured,
    flyerImages: data.flyer_images || [],
    reminderEnabled: data.reminder_enabled,
    coordinates: data.coordinates,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at,
  };
}
