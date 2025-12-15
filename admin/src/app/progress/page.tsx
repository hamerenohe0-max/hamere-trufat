"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProgressList } from "@/features/progress/components/ProgressList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgressPage() {
  const router = useRouter();

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
              <p className="text-gray-600 mt-1">Manage progress reports and updates</p>
            </div>
            <Button onClick={() => router.push("/progress/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
          <ProgressList />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

