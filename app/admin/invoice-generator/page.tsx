"use client";

import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import { useAdminAuth } from "@/lib/admin-auth";

export default function InvoiceGeneratorPage() {
  const { user, adminProfile } = useAdminAuth();
  return <InvoiceGenerator userId={user?.id} userName={adminProfile?.name || user?.email || "Admin"} />;
}
