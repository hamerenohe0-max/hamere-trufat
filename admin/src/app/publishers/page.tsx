"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublisherList } from "@/features/roles/components/PublisherList";
import { PublisherManagement } from "@/features/users/components/PublisherManagement";
import { Button } from "@/components/ui/button";

export default function PublishersPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "manage">("manage");

  return (
    <AuthGate roles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publisher Management</h1>
              <p className="text-gray-600 mt-1">
                Manage publishers and review approval requests
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("manage")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "manage"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Publishers
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Approval Requests
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "manage" ? (
            <PublisherManagement />
          ) : (
            <PublisherList />
          )}
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

