import { useAuthStore } from '../store/useAuthStore';
import { getApiBaseUrl, shouldUseMockData } from '../config/api.config';

export const API_URL = getApiBaseUrl();
export const USE_MOCK_DATA = shouldUseMockData();

interface ApiOptions extends Omit<RequestInit, 'body'> {
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
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth !== false && tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const fullUrl = `${API_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
      body:
        options.body && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch (error: any) {
    // Network error (connection failed, DNS error, etc.)
    console.error('API Fetch Network Error:', {
      url: fullUrl,
      method: options.method || 'GET',
      error: error.message,
      errorType: error.name,
      errorCode: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Network error: Unable to connect to ${API_URL}. Please check your internet connection and ensure the backend is running.`,
    );
  }

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
    let errorMessage = 'Request failed';

    try {
      const errorData = JSON.parse(detail);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If not JSON, use the text as-is or default message
      errorMessage = detail || errorMessage;
    }

    // Log detailed error information
    console.error('API Fetch Error Response:', {
      url: fullUrl,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      errorMessage,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });

    // Provide more specific error messages
    if (response.status === 401) {
      errorMessage = 'Please log in to access this resource';
    } else if (response.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (response.status === 400) {
      errorMessage = errorMessage || 'Invalid request. Please check your input.';
    } else if (response.status === 404) {
      errorMessage = 'Resource not found';
    } else if (response.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (response.status === 0) {
      // CORS error or network failure
      errorMessage = `CORS or network error. Unable to reach ${API_URL}. Please check CORS configuration and network connectivity.`;
    }

    throw new Error(errorMessage);
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

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!res.ok) {
      console.error('Token refresh failed:', {
        status: res.status,
        statusText: res.statusText,
      });
      clearSession();
      throw new Error('Unable to refresh session');
    }

    const data = await res.json();
    setSession({
      user: data.user ?? user,
      tokens: data.tokens,
    });
  } catch (error: any) {
    console.error('Token refresh error:', {
      error: error.message,
      errorType: error.name,
    });
    clearSession();
    throw error;
  }
}

async function safeRead(response: Response) {
  try {
    const text = await response.text();
    return text;
  } catch {
    return '';
  }
}

