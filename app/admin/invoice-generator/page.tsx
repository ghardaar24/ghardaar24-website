"use client";

import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import { useAdminAuth } from "@/lib/admin-auth";

export default function InvoiceGeneratorPage() {
  const { user } = useAdminAuth();
  return <InvoiceGenerator userId={user?.id} userName={user?.email || "Admin"} />;
}
