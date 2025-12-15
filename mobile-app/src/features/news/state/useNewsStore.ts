import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NewsState {
  bookmarks: Record<string, string | undefined>;
  reactions: Record<string, 'like' | 'dislike' | undefined>;
  toggleBookmark: (newsId: string, title: string) => void;
  react: (newsId: string, value: 'like' | 'dislike') => void;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      bookmarks: {},
      reactions: {},
      toggleBookmark: (newsId, title) => {
        const current = get().bookmarks;
        const next = { ...current };
        if (next[newsId]) {
          delete next[newsId];
        } else {
          next[newsId] = title;
        }
        set({ bookmarks: next });
      },
      react: (newsId, value) => {
        set((state) => ({
          reactions: { ...state.reactions, [newsId]: value },
        }));
      },
    }),
    {
      name: 'hamere-news',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);


