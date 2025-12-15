import { apiFetch } from '../../../services/api';
import { Event } from '../../../types/models';
import { mockEvents } from '../../../data/mock-events';

// Mock events API - will be replaced with real API later
const mockReminders: Record<string, boolean> = {};

export const eventsApi = {
  list: async (): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEvents.map((e) => ({
      ...e,
      reminderEnabled: mockReminders[e.id] ?? false,
    }));
  },
  detail: async (id: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const event = mockEvents.find((e) => e.id === id);
    if (!event) throw new Error('Event not found');
    return {
      ...event,
      reminderEnabled: mockReminders[id] ?? false,
    };
  },
  reminder: async (
    id: string,
    enabled: boolean,
  ): Promise<{ reminderEnabled: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    mockReminders[id] = enabled;
    return { reminderEnabled: enabled };
  },
};


