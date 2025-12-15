import { apiFetch } from '../../../services/api';
import { Feast } from '../../../types/models';
import { mockFeasts } from '../../../data/mock-feasts';

// Mock feasts API - will be replaced with real API later
const mockReminders: Record<string, boolean> = {};

export const feastsApi = {
  list: async (): Promise<Feast[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFeasts.map((f) => ({
      ...f,
      reminderEnabled: mockReminders[f.id] ?? false,
    }));
  },
  detail: async (id: string): Promise<Feast> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const feast = mockFeasts.find((f) => f.id === id);
    if (!feast) throw new Error('Feast not found');

    // Add mock data for biography, traditions, readings, prayers if not present
    return {
      ...feast,
      biography:
        feast.biography ||
        `This is a brief biography about ${feast.name}, an important feast in the Ethiopian Orthodox calendar.`,
      traditions:
        feast.traditions || [
          'Special prayers and hymns',
          'Community gatherings',
          'Traditional celebrations',
        ],
      readings:
        feast.readings || [
          'Gospel reading for the day',
          'Epistle reading',
          'Psalms',
        ],
      prayers:
        feast.prayers || [
          'Morning prayer',
          'Evening prayer',
          'Special intercessions',
        ],
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

