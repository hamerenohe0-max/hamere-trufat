"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProfileSettings } from "@/features/profile/components/ProfileSettings";

export default function ProfilePage() {
  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <ProfileSettings />
      </AdminLayout>
    </AuthGate>
  );
}
