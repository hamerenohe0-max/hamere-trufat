"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";
import { buildBrowserDeviceContext } from "@/lib/device";

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
            <Label>Email</Label>
            <Input
              type="email"
              className="mt-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              className="mt-1"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as Error).message ?? "Login failed"}
            </p>
          )}
          <Button
            onClick={() => {
              clearSession();
              mutation.mutate();
            }}
            disabled={!email || !password || mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}


