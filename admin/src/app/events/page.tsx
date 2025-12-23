"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EventList } from "@/features/events/components/EventList";
import { EventForm } from "@/features/events/components/EventForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EventsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
              <p className="text-gray-600 mt-1">
                Manage upcoming events and schedules
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          <EventList />

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AuthGate>
  );
}
