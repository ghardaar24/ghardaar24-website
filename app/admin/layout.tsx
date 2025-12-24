"use client";

import { AuthProvider } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  );
}
