"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ArticleList } from "@/features/articles/components/ArticleList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ArticlesPage() {
  const router = useRouter();

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Article Management</h1>
              <p className="text-gray-600 mt-1">Create and manage spiritual articles</p>
            </div>
            <Button onClick={() => router.push("/articles/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </div>
          <ArticleList />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

