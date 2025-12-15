import { apiFetch } from '../../../services/api';
import { DailyReading } from '../../../types/models';
import { mockReadings } from '../../../data/mock-readings';

// Mock readings API - will be replaced with real API later
const mockReminders: Record<string, boolean> = {};

export const readingsApi = {
  getByDate: async (date: string): Promise<DailyReading> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Find reading for date or use closest one
    let reading = mockReadings.find((r) => r.date === date);
    if (!reading && mockReadings.length > 0) {
      // Use the reading with the closest date
      reading = mockReadings.reduce((prev, curr) => {
        const prevDiff = Math.abs(
          new Date(prev.date).getTime() - new Date(date).getTime(),
        );
        const currDiff = Math.abs(
          new Date(curr.date).getTime() - new Date(date).getTime(),
        );
        return currDiff < prevDiff ? curr : prev;
      });
    }
    if (!reading) throw new Error('Reading not found');

    // Convert to DailyReading format expected by the app
    return {
      id: reading.id,
      date: reading.date,
      gospel: {
        title: reading.gospel.book,
        reference: `${reading.gospel.book} ${reading.gospel.chapter}:${reading.gospel.verses.join(',')}`,
        body: reading.gospel.text,
        audioUrl: reading.gospel.audioUrl,
      },
      epistle: {
        title: reading.epistle?.book || 'Default Epistle',
        reference: reading.epistle
          ? `${reading.epistle.book} ${reading.epistle.chapter}:${reading.epistle.verses.join(',')}`
          : 'Default 1:1',
        body: reading.epistle?.text || 'Default epistle reading text.',
      },
      psalms: reading.psalms ? [reading.psalms.text] : ['Default psalm text.'],
      reflections: reading.reflection ? [reading.reflection] : ['Default reflection.'],
      reminderEnabled: mockReminders[date] ?? false,
    };
  },
  reminder: async (
    date: string,
    enabled: boolean,
  ): Promise<{ reminderEnabled: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    mockReminders[date] = enabled;
    return { reminderEnabled: enabled };
  },
};


