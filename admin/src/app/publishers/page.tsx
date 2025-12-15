"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublisherList } from "@/features/roles/components/PublisherList";

export default function PublishersPage() {
  return (
    <AuthGate roles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Publisher Approvals</h1>
            <p className="text-gray-600 mt-1">Review and approve publisher requests</p>
          </div>
          <PublisherList />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

