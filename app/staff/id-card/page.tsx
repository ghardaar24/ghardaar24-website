"use client";

import { useRef, useState } from "react";
import { useStaffAuth } from "@/lib/staff-auth";
import { motion } from "@/lib/motion";
import { User, Download, IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toPng } from "html-to-image";
import PageHeader from "@/components/admin/PageHeader";

export default function StaffIdCardPage() {
  const { staffProfile, loading } = useStaffAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `${staffProfile?.employee_code || "ghardaar24"}-id-card.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Skeleton className="h-8 w-56 mb-6" />
        <Skeleton className="h-64 w-full max-w-sm" />
      </div>
    );
  }

  if (!staffProfile) return null;

  if (!staffProfile.id_card_issued_at) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
          <IdCard className="w-10 h-10 mx-auto mb-3" style={{ color: "#9ca3af" }} />
          <p>Your ID card hasn&apos;t been generated yet. Please contact your admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Account"
        title="My ID card"
        description="Your official Ghardaar24 employee ID."
        actions={
          <>
            <Button onClick={handleDownload} disabled={downloading} className="btn-admin-primary">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? "Preparing..." : "Download"}
            </Button>
          </>
        }
      />

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "21.6rem",
          maxWidth: "100%",
          borderRadius: "1.1rem",
          overflow: "hidden",
          border: "1px solid #e2e2e7",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.12)",
          background: "#ffffff",
          fontFamily: "inherit",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(120deg, #1f2937 0%, #111827 55%, #f36a2a 140%)",
            padding: "1.1rem 1.4rem",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.04em" }}>GHARDAAR24</div>
            <div style={{ fontSize: "0.6875rem", opacity: 0.75, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Employee Identity Card
            </div>
          </div>
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "0.6rem",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <IdCard className="w-5 h-5" style={{ color: "#fff" }} />
          </div>
        </div>

        {/* Accent strip */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #f36a2a, #c2410c)" }} />

        <div style={{ padding: "1.5rem 1.5rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem" }}>
          <Avatar style={{ width: "5.75rem", height: "5.75rem", border: "3px solid #f3f4f6", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
            {staffProfile.profile_picture_url ? (
              <AvatarImage src={staffProfile.profile_picture_url} alt={staffProfile.name} crossOrigin="anonymous" />
            ) : (
              <AvatarFallback>
                <User className="w-8 h-8" style={{ color: "#9ca3af" }} />
              </AvatarFallback>
            )}
          </Avatar>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827" }}>{staffProfile.name}</div>
            {staffProfile.designation && (
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#c2410c",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginTop: "0.15rem",
                }}
              >
                {staffProfile.designation}
              </div>
            )}
          </div>

          <div style={{ width: "100%", borderTop: "1px dashed #e5e7eb", margin: "0.1rem 0" }} />

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.8125rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Employee ID</span>
              <span style={{ fontWeight: 700, color: "#111827", fontFamily: "monospace", letterSpacing: "0.03em" }}>
                {staffProfile.employee_code || "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Email</span>
              <span style={{ fontWeight: 600, color: "#374151" }}>{staffProfile.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Issued On</span>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                {new Date(staffProfile.id_card_issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "0.7rem 1.5rem",
            background: "#f9fafb",
            borderTop: "1px solid #f0f0f0",
            fontSize: "0.6875rem",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          This card is the property of Ghardaar24. If found, please return to the nearest office.
        </div>
      </motion.div>
    </div>
  );
}
