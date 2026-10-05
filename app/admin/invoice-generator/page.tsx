"use client";

import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import PageHeader from "@/components/admin/PageHeader";
import { useAdminAuth } from "@/lib/admin-auth";

export default function InvoiceGeneratorPage() {
  const { user, adminProfile } = useAdminAuth();
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Money"
        title="Invoices"
        description="Fill in the details, check the preview, then print or save as PDF."
      />
      <InvoiceGenerator userId={user?.id} userName={adminProfile?.name || user?.email || "Admin"} />
    </div>
  );
}
