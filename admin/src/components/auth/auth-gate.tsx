"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";

interface AuthGateProps {
  children: ReactNode;
  roles?: Array<"admin" | "publisher" | "user">;
}

export function AuthGate({ children, roles }: AuthGateProps) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hydrated) return;
    const unauthorized =
      !user || (roles && user && !roles.includes(user.role as any));

    if (unauthorized) {
      router.replace("/auth/login");
    }
  }, [hydrated, user, roles, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading session…
      </div>
    );
  }

  if (!user || (roles && !roles.includes(user.role as any))) {
    return null;
  }

  return <>{children}</>;
}


