"use client";

import { apiFetch } from "./api";
import { AdminUser, TokenBundle } from "../store/auth-store";

export interface AuthResponse {
  user: AdminUser | null;
  tokens: TokenBundle;
}

export const authClient = {
  login: (payload: {
    email: string;
    password: string;
    device?: {
      deviceId: string;
      deviceName?: string;
      devicePlatform?: string;
    };
  }) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),
  profile: () => apiFetch<AdminUser>("/users/me"),
  logout: () =>
    apiFetch<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),
};


