"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Mail, Loader2, Save } from "lucide-react";
import { ProfileForm } from "../services/profile.api";

interface ProfileInfoFormProps {
  form: ProfileForm;
  isSaving: boolean;
  onChange: Dispatch<SetStateAction<ProfileForm>>;
  onSubmit: (event: FormEvent) => void;
}

export function ProfileInfoForm({
  form,
  isSaving,
  onChange,
  onSubmit,
}: ProfileInfoFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="max-w-xs">
              <ImageUpload
                value={form.avatarUrl}
                onChange={(url) =>
                  onChange((prev) => ({ ...prev, avatarUrl: url || "" }))
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
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, name: event.target.value }))
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
              onChange={(event) =>
                onChange((prev) => ({ ...prev, bio: event.target.value }))
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
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, region: event.target.value }))
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
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, language: event.target.value }))
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
              onChange={(event) =>
                onChange((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="+251 9XX XXX XXX"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
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
  );
}
