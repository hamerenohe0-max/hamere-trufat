"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuthStore, AdminUser } from "@/store/auth-store";
import { apiFetch } from "@/lib/api";

interface ProfileForm {
  name: string;
  bio: string;
  region: string;
  language: string;
  phone: string;
}

export default function ProfilePage() {
  const setSession = useAuthStore((state) => state.setSession);
  const tokens = useAuthStore((state) => state.tokens);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    region: "",
    language: "",
    phone: "",
  });

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: authClient.profile,
    enabled: !!tokens,
    onSuccess: (profile) => {
      setSession({ user: profile, tokens: tokens! });
      setForm({
        name: profile.name,
        bio: profile.profile?.bio ?? "",
        region: profile.profile?.region ?? "",
        language: profile.profile?.language ?? "",
        phone: profile.profile?.phone ?? "",
      });
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<AdminUser>("/users/me", {
        method: "PATCH",
        body: form,
      }),
    onSuccess: (profile) => {
      if (!tokens) return;
      setSession({ user: profile, tokens });
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data.profile ?? {};
      setForm({
        name: profileQuery.data.name,
        bio: profile.bio ?? "",
        region: profile.region ?? "",
        language: profile.language ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profileQuery.data]);

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">
            Profile
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Account details
          </h1>
          <p className="text-sm text-slate-500">
            Update your contact information and profile bio.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {renderInput("Full name", form.name, (value) =>
            setForm((prev) => ({ ...prev, name: value })),
          )}
          {renderTextArea("Bio", form.bio, (value) =>
            setForm((prev) => ({ ...prev, bio: value })),
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {renderInput("Region", form.region, (value) =>
              setForm((prev) => ({ ...prev, region: value })),
            )}
            {renderInput("Language", form.language, (value) =>
              setForm((prev) => ({ ...prev, language: value })),
            )}
          </div>
          {renderInput("Phone", form.phone, (value) =>
            setForm((prev) => ({ ...prev, phone: value })),
          )}

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as Error).message ?? "Update failed"}
            </p>
          )}

          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </AuthGate>
  );
}

function renderInput(
  label: string,
  value: string,
  onChange: (value: string) => void,
) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function renderTextArea(
  label: string,
  value: string,
  onChange: (value: string) => void,
) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      {label}
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}


