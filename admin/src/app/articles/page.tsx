"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ArticleList } from "@/features/articles/components/ArticleList";
import { ArticleForm } from "@/features/articles/components/ArticleForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function ArticlesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Article Management</h1>
              <p className="text-gray-600 mt-1">Create and manage spiritual articles</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </div>
          
          <ArticleList />

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
              </DialogHeader>
              <ArticleForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AuthGate>
  );
}
