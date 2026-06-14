import { apiFetch } from "@/lib/api";
import type { AdminUser } from "@/store/auth-store";

export interface ProfileForm {
  name: string;
  email: string;
  bio: string;
  region: string;
  language: string;
  phone: string;
  avatarUrl: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileApi = {
  updateProfile: (data: Partial<ProfileForm>) =>
    apiFetch<AdminUser>("/users/me", {
      method: "PATCH",
      body: data,
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ success: boolean }>("/users/me/change-password", {
      method: "POST",
      body: data,
    }),
};
