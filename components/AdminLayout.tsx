"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  Home,
  Building,
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/properties", icon: Building, label: "Properties" },
  { href: "/admin/properties/new", icon: Plus, label: "Add Property" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, router, pathname]);

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
        <span className="admin-brand">Ghardaar24</span>
      </motion.header>

      {/* Sidebar */}
      <motion.aside
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ transform: undefined }}
      >
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-logo">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Home className="w-8 h-8 text-blue-400" />
            </motion.div>
            <span>Ghardaar24</span>
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
      </motion.aside>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
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
