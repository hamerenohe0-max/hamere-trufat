"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserList } from "@/features/users/components/UserList";

export default function UsersPage() {
  return (
    <AuthGate roles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users and their roles</p>
          </div>
          <UserList />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

