"use client";

import { Lock } from "lucide-react";
import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import PageHeader from "@/components/admin/PageHeader";
import { useStaffAuth } from "@/lib/staff-auth";

export default function StaffInvoiceGeneratorPage() {
  const { staffProfile } = useStaffAuth();

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Money"
        title="Invoices"
        description="Fill in the details, check the preview, then print or save as PDF."
      />
      {staffProfile?.can_generate_invoices ? (
        <InvoiceGenerator userId={staffProfile.id} userName={staffProfile.name} />
      ) : (
        <div className="bo-panel bo-empty">
          <Lock className="w-6 h-6" />
          <p>You don&apos;t have permission to create invoices. Ask an admin to turn it on for you.</p>
        </div>
      )}
    </div>
  );
}
