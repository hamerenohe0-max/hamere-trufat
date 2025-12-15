"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { NotificationForm } from "@/features/notifications/components/NotificationForm";

export default function NewNotificationPage() {
  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send Push Notification</h1>
            <p className="text-gray-600 mt-1">Send a notification to users</p>
          </div>
          <NotificationForm />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

