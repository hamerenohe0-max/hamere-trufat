`use client`;

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "publisher" | "admin" | "guest";
  status?: string;
  profile?: {
    bio?: string;
    region?: string;
    language?: string;
    phone?: string;
    avatarUrl?: string;
  };
  lastLoginAt?: string;
}

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
  guest?: boolean;
}

interface AuthState {
  user: AdminUser | null;
  tokens: TokenBundle | null;
  hydrated: boolean;
  setSession: (payload: { user: AdminUser | null; tokens: TokenBundle }) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setSession: ({ user, tokens }) =>
        set({
          user: user ?? null,
          tokens,
        }),
      clearSession: () =>
        set({
          user: null,
          tokens: null,
        }),
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
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
  !!state.user && !!state.tokens?.accessToken;


