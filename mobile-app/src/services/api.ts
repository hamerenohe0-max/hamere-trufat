import { useAuthStore } from '../store/useAuthStore';
import { getApiBaseUrl, shouldUseMockData } from '../config/api.config';

export const API_URL = getApiBaseUrl();
export const USE_MOCK_DATA = shouldUseMockData();

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
  attempt = 0,
): Promise<T> {
  const { tokens } = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth !== false && tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== 'string'
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
    const detail = await safeRead(response);
    throw new Error(detail || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

async function refreshSession() {
  const { tokens, setSession, clearSession, user } = useAuthStore.getState();
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!res.ok) {
    clearSession();
    throw new Error('Unable to refresh session');
  }

  const data = await res.json();
  setSession({
    user: data.user ?? user,
    tokens: data.tokens,
  });
}

async function safeRead(response: Response) {
  try {
    const text = await response.text();
    return text;
  } catch {
    return '';
  }
}

