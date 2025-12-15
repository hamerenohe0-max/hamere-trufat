"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EventList } from "@/features/events/components/EventList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const router = useRouter();

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
              <p className="text-gray-600 mt-1">Create and manage church events</p>
            </div>
            <Button onClick={() => router.push("/events/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
          <EventList />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

