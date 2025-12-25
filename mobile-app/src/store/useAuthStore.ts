import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { TokenBundle } from '../services/auth';

interface AuthState {
  user: User | null;
  tokens: TokenBundle | null;
  guest: boolean;
  hydrated: boolean;
  setSession: (payload: { user: User | null; tokens: TokenBundle }) => void;
  startGuestSession: (tokens: TokenBundle) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      guest: false,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setSession: ({ user, tokens }) =>
        set({
          user: user ?? get().user,
          tokens,
          guest: !!tokens?.guest,
        }),
      startGuestSession: (tokens) =>
        set({
          user: null,
          tokens,
          guest: true,
        }),
      clearSession: () =>
        set({
          user: null,
          tokens: null,
          guest: false,
        }),
      updateUser: (userPartial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userPartial } : null,
        })),
    }),
    {
      name: 'hamere-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        guest: state.guest,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated(true);
        }
      },
    },
  ),
);

export const selectIsAuthenticated = (state: AuthState) =>
  !!state.tokens?.accessToken && (!!state.user || state.guest);

