"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PropertyAuthGuardProps {
  children: React.ReactNode;
  propertyTitle?: string;
}

export default function PropertyAuthGuard({
  children,
  propertyTitle,
}: PropertyAuthGuardProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during hydration and auth loading
  if (!mounted || loading) {
    return (
      <div className="property-auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If user is authenticated, show the content
  if (user) {
    return <>{children}</>;
  }

  // User is not authenticated - show login prompt
  return (
    <motion.div
      className="property-auth-gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="property-auth-gate-content">
        <div className="property-auth-gate-icon">
          <Lock className="w-12 h-12" />
        </div>

        <h2 className="property-auth-gate-title">Login Required</h2>

        <p className="property-auth-gate-text">
          {propertyTitle
            ? `Please login to view details for "${propertyTitle}"`
            : "Please login to view property details"}
        </p>

        <div className="property-auth-gate-actions">
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
            className="property-auth-gate-btn primary"
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>

          <Link
            href="/auth/signup"
            className="property-auth-gate-btn secondary"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </Link>
        </div>

        <p className="property-auth-gate-footer">
          Creating an account is free and takes less than a minute!
        </p>
      </div>
    </motion.div>
  );
}
