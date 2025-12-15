"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Push Notifications</h1>
              <p className="text-gray-600 mt-1">Send push notifications to users</p>
            </div>
            <Button onClick={() => router.push("/notifications/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>
          <NotificationList />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

