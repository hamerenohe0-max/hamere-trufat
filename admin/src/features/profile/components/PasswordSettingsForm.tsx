"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Loader2, Lock } from "lucide-react";
import { PasswordForm } from "../services/profile.api";

interface PasswordSettingsFormProps {
  form: PasswordForm;
  isSaving: boolean;
  onChange: Dispatch<SetStateAction<PasswordForm>>;
  onSubmit: (event: FormEvent) => void;
}

export function PasswordSettingsForm({
  form,
  isSaving,
  onChange,
  onSubmit,
}: PasswordSettingsFormProps) {
  const passwordsDoNotMatch =
    form.newPassword &&
    form.confirmPassword &&
    form.newPassword !== form.confirmPassword;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
                value={form.currentPassword}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
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
                value={form.newPassword}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
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
                value={form.confirmPassword}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {passwordsDoNotMatch && (
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
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
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
  );
}
