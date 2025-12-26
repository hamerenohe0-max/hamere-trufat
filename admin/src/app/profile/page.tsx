"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthStore, AdminUser } from "@/store/auth-store";
import { apiFetch } from "@/lib/api";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";
import { User, Mail, Lock, Save, Loader2 } from "lucide-react";

interface ProfileForm {
  name: string;
  email: string;
  bio: string;
  region: string;
  language: string;
  phone: string;
  avatarUrl: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const setSession = useAuthStore((state) => state.setSession);
  const tokens = useAuthStore((state) => state.tokens);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    bio: "",
    region: "",
    language: "",
    phone: "",
    avatarUrl: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: authClient.profile,
    enabled: !!tokens,
  });

  const profileMutation = useMutation({
    mutationFn: (data: Partial<ProfileForm>) =>
      apiFetch<AdminUser>("/users/me", {
        method: "PATCH",
        body: data,
      }),
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
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiFetch<{ success: boolean }>("/users/me/change-password", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
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
    }
  }, [profileQuery.data, tokens, setSession]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(form);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <AuthGate roles={["admin", "publisher"]}>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </AdminLayout>
      </AuthGate>
    );
  }

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your account information and security settings
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
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

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h2>

                  {/* Avatar Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="max-w-xs">
                      <ImageUpload
                        value={form.avatarUrl}
                        onChange={(url) =>
                          setForm((prev) => ({ ...prev, avatarUrl: url || "" }))
                        }
                        folder="hamere-trufat/profiles"
                        maxSizeMB={5}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </div>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        disabled
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      rows={4}
                      maxLength={160}
                      placeholder="Tell us about yourself..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {form.bio.length}/160 characters
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        value={form.region}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, region: e.target.value }))
                        }
                        placeholder="e.g., Addis Ababa"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <input
                        type="text"
                        value={form.language}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, language: e.target.value }))
                        }
                        placeholder="e.g., Amharic, English"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+251 9XX XXX XXX"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={profileMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {profileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Update your password to keep your account secure. Use a strong
                    password with at least 8 characters.
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      {passwordForm.newPassword &&
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !== passwordForm.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            Passwords do not match
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {passwordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </AuthGate>
  );
}
