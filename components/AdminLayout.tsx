"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import Image from "next/image";
import {
  Building,
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Plus,
  Settings,
  User,
  Users,
  UserCog,
  CheckCircle,
  MapPin,
  Download,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/properties", icon: Building, label: "Properties" },
  { href: "/admin/properties/new", icon: Plus, label: "Add Property" },
  { href: "/admin/approvals", icon: CheckCircle, label: "Approvals" },
  { href: "/admin/locations", icon: MapPin, label: "Locations" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
  { href: "/admin/leads", icon: User, label: "Leads" },
  { href: "/admin/crm", icon: Users, label: "CRM" },
  { href: "/admin/tasks", icon: ClipboardList, label: "Tasks" },
  { href: "/admin/staff", icon: UserCog, label: "Staff Management" },
  { href: "/admin/downloads", icon: Download, label: "Downloads" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, adminProfile, loading, signOut } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== "/admin/login") {
      router.push("/admin/login");
      return;
    }
  }, [user, loading, router, pathname]);

  // Handle sidebar visibility on desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <motion.header
        className="admin-mobile-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <span className="admin-brand flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Ghardaar24"
            width={120}
            height={40}
            className="h-10 w-auto"
            style={{ height: "40px", width: "auto" }}
          />
        </span>
      </motion.header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-logo">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo2.png"
                alt="Ghardaar24"
                width={120}
                height={40}
                style={{ height: "40px", width: "auto" }}
              />
            </motion.div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={`sidebar-link ${
                  isActive(item.href) ? "active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Admin Info */}
          {adminProfile && (
            <motion.div
              className="sidebar-admin-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div className="sidebar-admin-avatar">
                <User className="w-5 h-5" />
              </div>
              <div className="sidebar-admin-details">
                <span className="sidebar-admin-name">
                  {adminProfile.name || "Admin"}
                </span>
                <span className="sidebar-admin-email">
                  {adminProfile.email}
                </span>
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/" className="sidebar-link" target="_blank">
              <Settings className="w-5 h-5" />
              <span>View Site</span>
            </Link>
          </motion.div>
          <motion.button
            onClick={signOut}
            className="sidebar-link logout"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* Overlay - only show on mobile */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        className="admin-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
