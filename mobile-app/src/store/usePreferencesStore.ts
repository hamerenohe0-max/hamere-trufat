import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface PreferencesState {
  theme: ThemeMode;
  language: string;
  fontScale: number;
  notificationPrefs: {
    push: boolean;
    email: boolean;
    reminders: boolean;
  };
  offlineMode: {
    autoSync: boolean;
    wifiOnly: boolean;
  };
  setTheme: (mode: ThemeMode) => void;
  setLanguage: (lang: string) => void;
  setFontScale: (scale: number) => void;
  setNotifications: (
    prefs: Partial<PreferencesState['notificationPrefs']>,
  ) => void;
  setOfflineMode: (prefs: Partial<PreferencesState['offlineMode']>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'en',
      fontScale: 1,
      notificationPrefs: {
        push: true,
        email: false,
        reminders: true,
      },
      offlineMode: {
        autoSync: true,
        wifiOnly: false,
      },
      setTheme: (mode) => set({ theme: mode }),
      setLanguage: (language) => set({ language }),
      setFontScale: (fontScale) => set({ fontScale }),
      setNotifications: (prefs) =>
        set({
          notificationPrefs: { ...get().notificationPrefs, ...prefs },
        }),
      setOfflineMode: (prefs) =>
        set({
          offlineMode: { ...get().offlineMode, ...prefs },
        }),
    }),
    {
      name: 'hamere-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);


