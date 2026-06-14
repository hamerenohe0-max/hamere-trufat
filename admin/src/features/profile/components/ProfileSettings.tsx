"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Loader2, Lock, User } from "lucide-react";
import { PasswordForm, ProfileForm, profileApi } from "../services/profile.api";
import { PasswordSettingsForm } from "./PasswordSettingsForm";
import { ProfileInfoForm } from "./ProfileInfoForm";

const emptyProfileForm: ProfileForm = {
  name: "",
  email: "",
  bio: "",
  region: "",
  language: "",
  phone: "",
  avatarUrl: "",
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ProfileSettings() {
  const setSession = useAuthStore((state) => state.setSession);
  const tokens = useAuthStore((state) => state.tokens);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [form, setForm] = useState<ProfileForm>(emptyProfileForm);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPasswordForm);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: authClient.profile,
    enabled: !!tokens,
  });

  const profileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (profile) => {
      if (!tokens) return;
      setSession({ user: profile, tokens });
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm);
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    if (tokens) {
      setSession({ user: profileQuery.data, tokens });
    }

    const profile = profileQuery.data.profile ?? {};
    setForm({
      name: profileQuery.data.name || "",
      email: profileQuery.data.email || "",
      bio: profile.bio ?? "",
      region: profile.region ?? "",
      language: profile.language ?? "",
      phone: profile.phone ?? "",
      avatarUrl: profile.avatarUrl ?? "",
    });
  }, [profileQuery.data, tokens, setSession]);

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault();
    profileMutation.mutate(form);
  };

  const handlePasswordSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and security settings
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Information
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </div>
          </button>
        </nav>
      </div>

      {activeTab === "profile" && (
        <ProfileInfoForm
          form={form}
          isSaving={profileMutation.isPending}
          onChange={setForm}
          onSubmit={handleProfileSubmit}
        />
      )}

      {activeTab === "password" && (
        <PasswordSettingsForm
          form={passwordForm}
          isSaving={passwordMutation.isPending}
          onChange={setPasswordForm}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
}
