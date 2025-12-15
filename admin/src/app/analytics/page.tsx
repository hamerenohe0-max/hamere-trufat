"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Views, engagement, and content performance</p>
          </div>
          <AnalyticsDashboard />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

