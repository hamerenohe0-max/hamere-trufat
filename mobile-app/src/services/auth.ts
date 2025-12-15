import { apiFetch } from './api';
import { User } from '../types/models';

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  guest?: boolean;
}

export interface AuthResponse {
  user: User | null;
  tokens: TokenBundle;
  otpRequired?: boolean;
}

export interface DeviceContext {
  deviceId: string;
  deviceName?: string;
  devicePlatform?: string;
  appVersion?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  requireOtp?: boolean;
  device?: DeviceContext;
}

export interface LoginPayload {
  email: string;
  password: string;
  device?: DeviceContext;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  verifyOtp: (payload: { email: string; code: string }) =>
    apiFetch<{ success: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  forgotPassword: (payload: { email: string }) =>
    apiFetch<{ success: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  resetPassword: (payload: {
    email: string;
    code: string;
    newPassword: string;
  }) =>
    apiFetch<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
  guest: () =>
    apiFetch<AuthResponse>('/auth/guest', {
      method: 'POST',
      auth: false,
    }),
  profile: () => apiFetch<User>('/users/me'),
  updateProfile: (
    payload: Partial<User['profile']> & {
      name?: string;
    },
  ) =>
    apiFetch<User>('/users/me', {
      method: 'PATCH',
      body: payload,
    }),
  logout: () =>
    apiFetch<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),
};


