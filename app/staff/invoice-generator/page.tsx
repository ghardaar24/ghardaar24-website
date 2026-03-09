"use client";

import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import { useStaffAuth } from "@/lib/staff-auth";

export default function StaffInvoiceGeneratorPage() {
  const { staffProfile } = useStaffAuth();
  
  if (!staffProfile?.can_generate_invoices) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#991b1b' }}>Access Denied</h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>You do not have permission to generate invoices.</p>
      </div>
    );
  }

  return <InvoiceGenerator userId={staffProfile.id} userName={staffProfile.name} />;
}
