"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "../../../lib/auth-client";
import { useAuthStore } from "../../../store/auth-store";
import { buildBrowserDeviceContext } from "../../../lib/device";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const device = await buildBrowserDeviceContext();
      return authClient.login({ email, password, device });
    },
    onSuccess: (response) => {
      if (!response.user) {
        throw new Error("No user found");
      }
      setSession({ user: response.user, tokens: response.tokens });
      router.replace("/");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Hamere Trufat Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Sign in
        </h1>
        <p className="text-sm text-slate-500">
          Enter your credentials to manage assignments and content.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as Error).message ?? "Login failed"}
            </p>
          )}
          <button
            onClick={() => {
              clearSession();
              mutation.mutate();
            }}
            disabled={!email || !password || mutation.isPending}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}


