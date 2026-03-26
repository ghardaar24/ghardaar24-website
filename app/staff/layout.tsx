"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStaffAuth, supabaseStaff } from "@/lib/staff-auth";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogOut, FileSpreadsheet, MessageSquare, CheckSquare, Building, Receipt, MapPin, Camera, Loader2, User, Mail } from "lucide-react";

function StaffLayoutContent({ children }: { children: ReactNode }) {
  const { staffProfile, accessibleInquiryTypes, loading, signOut, refreshProfile } = useStaffAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !staffProfile) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    setUploadingPicture(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `staff/${staffProfile.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabaseStaff.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseStaff.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabaseStaff
        .from("crm_staff")
        .update({ profile_picture_url: urlWithCacheBust })
        .eq("id", staffProfile.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!loading && !staffProfile && pathname !== "/staff/login") {
      router.push("/staff/login");
    }
  }, [loading, staffProfile, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="staff-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="staff-loading">
          <div className="staff-loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page without layout
  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  // For authenticated pages, show layout
  if (!staffProfile) {
    return null;
  }

  const hasInquiryAccess = accessibleInquiryTypes && accessibleInquiryTypes.length > 0;

  return (
    <div className="staff-layout">
      {/* Header */}
      <header className="staff-header">
        <div className="staff-header-content">
          <div className="staff-brand">
            <div className="staff-brand-icon">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="staff-brand-text">
              <h1>Staff Portal</h1>
              <p>Ghardaar24 CRM</p>
            </div>
          </div>
          <div className="staff-user-info">
            <div
              className="staff-profile-avatar"
              onClick={() => fileInputRef.current?.click()}
            >
              {staffProfile.profile_picture_url ? (
                <Image
                  src={staffProfile.profile_picture_url}
                  alt={staffProfile.name}
                  width={36}
                  height={36}
                  className="staff-avatar-img"
                  unoptimized
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <div className="staff-avatar-overlay">
                {uploadingPicture ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: "none" }}
              />
            </div>
            <div className="staff-user-details">
              <p className="staff-user-name">{staffProfile.name}</p>
              <p className="staff-user-email">{staffProfile.email}</p>
            </div>
            <button
              onClick={signOut}
              className="staff-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span className="staff-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="staff-nav">
        <div className="staff-nav-content">
          <Link
            href="/staff/crm"
            className={`staff-nav-link ${pathname === "/staff/crm" ? "active" : ""}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            CRM Dashboard
          </Link>
          <Link
            href="/staff/tasks"
            className={`staff-nav-link ${pathname === "/staff/tasks" ? "active" : ""}`}
          >
            <CheckSquare className="w-4 h-4" />
            My Tasks
          </Link>
          <Link
            href="/staff/site-visits"
            className={`staff-nav-link ${pathname === "/staff/site-visits" ? "active" : ""}`}
          >
            <MapPin className="w-4 h-4" />
            Site Visits
          </Link>
          {hasInquiryAccess && (
            <Link
              href="/staff/inquiries"
              className={`staff-nav-link ${pathname === "/staff/inquiries" ? "active" : ""}`}
            >
              <MessageSquare className="w-4 h-4" />
              Inquiries
            </Link>
          )}
          {staffProfile.can_manage_properties && (
            <Link
              href="/staff/properties"
              className={`staff-nav-link ${pathname === "/staff/properties" ? "active" : ""}`}
            >
              <Building className="w-4 h-4" />
              Properties
            </Link>
          )}
          {staffProfile.can_generate_invoices && (
            <Link
              href="/staff/invoice-generator"
              className={`staff-nav-link ${pathname === "/staff/invoice-generator" ? "active" : ""}`}
            >
              <Receipt className="w-4 h-4" />
              Invoice Generator
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="staff-main">
        {children}
      </main>
    </div>
  );
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <StaffLayoutContent>{children}</StaffLayoutContent>
  );
}
