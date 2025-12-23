"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProgressList } from "@/features/progress/components/ProgressList";
import { ProgressForm } from "@/features/progress/components/ProgressForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProgressPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
              <p className="text-gray-600 mt-1">
                Manage construction progress and updates
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>

          <ProgressList />

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Progress Report</DialogTitle>
              </DialogHeader>
              <ProgressForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AuthGate>
  );
}
