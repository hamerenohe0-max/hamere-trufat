"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MediaLibrary } from "@/features/media/components/MediaLibrary";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function MediaPage() {
  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
              <p className="text-gray-600 mt-1">Upload and manage media files</p>
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
          <MediaLibrary />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

