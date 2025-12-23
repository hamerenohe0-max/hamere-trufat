import { apiFetch } from "@/lib/api";

export interface EventItem {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  coordinates?: any;
  description: string;
  feast_id?: string;
  featured: boolean;
  flyer_images: string[];
  reminder_enabled: boolean;
  views: number;
  created_at: string;
}

export interface CreateEventDto {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  coordinates?: any;
  description: string;
  feastId?: string;
  featured?: boolean;
  flyerImages?: string[];
  reminderEnabled?: boolean;
}

export const eventsApi = {
  list: () => apiFetch<{ items: EventItem[] }>("/events"),
  get: (id: string) => apiFetch<EventItem>(`/events/${id}`),
  create: (data: CreateEventDto) =>
    apiFetch<EventItem>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreateEventDto>) =>
    apiFetch<EventItem>(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/events/${id}`, {
      method: "DELETE",
    }),
};
