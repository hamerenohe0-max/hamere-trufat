'use client';

import { useEffect } from "react";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { DashboardCharts } from "@/features/dashboard/components/DashboardCharts";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";

export default function Home() {
  const setSession = useAuthStore((state) => state.setSession);
  const tokens = useAuthStore((state) => state.tokens);

  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: authClient.profile,
    enabled: !!tokens,
  });

  useEffect(() => {
    if (profile && tokens) {
      setSession({ user: profile, tokens });
    }
  }, [profile, tokens, setSession]);

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Overview of your content and engagement metrics
            </p>
          </div>
          <DashboardStats />
          <DashboardCharts />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}
