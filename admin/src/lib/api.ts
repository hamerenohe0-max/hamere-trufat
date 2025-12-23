"use client";

import { useAuthStore } from "../store/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

interface ApiOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: any;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
  attempt = 0,
): Promise<T> {
  const { tokens } = useAuthStore.getState();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth !== false && tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  // Don't set Content-Type for FormData, let browser set it with boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body && typeof options.body !== "string"
          ? JSON.stringify(options.body)
          : options.body,
  });

  if (response.status === 401 && attempt === 0 && tokens?.refreshToken) {
    try {
      await refreshSession();
      return apiFetch<T>(path, options, attempt + 1);
    } catch (error) {
      useAuthStore.getState().clearSession();
      throw error;
    }
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Request failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Invalid JSON response");
  }
}

async function refreshSession() {
  const { tokens, setSession, user, clearSession } = useAuthStore.getState();
  if (!tokens?.refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    throw new Error("Unable to refresh session");
  }

  const data = await response.json();
  setSession({ user: data.user ?? user, tokens: data.tokens });
}


