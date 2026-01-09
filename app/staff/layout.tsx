"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StaffAuthProvider, useStaffAuth } from "@/lib/staff-auth";
import Link from "next/link";
import { LayoutDashboard, LogOut, FileSpreadsheet, MessageSquare, CheckSquare } from "lucide-react";

function StaffLayoutContent({ children }: { children: ReactNode }) {
  const { staffProfile, accessibleInquiryTypes, loading, signOut } = useStaffAuth();
  const router = useRouter();
  const pathname = usePathname();

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
            <div className="staff-user-details" style={{ display: 'none' }} data-sm-show="true">
              <p className="staff-user-name">{staffProfile.name}</p>
              <p className="staff-user-email">{staffProfile.email}</p>
            </div>
            <button
              onClick={signOut}
              className="staff-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span style={{ display: 'none' }} data-sm-show="true">Logout</span>
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
          {hasInquiryAccess && (
            <Link
              href="/staff/inquiries"
              className={`staff-nav-link ${pathname === "/staff/inquiries" ? "active" : ""}`}
            >
              <MessageSquare className="w-4 h-4" />
              Inquiries
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
