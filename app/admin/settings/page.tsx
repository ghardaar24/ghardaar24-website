"use client";

import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { motion } from "@/lib/motion";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Settings,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user, adminProfile, updatePassword } = useAdminAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await updatePassword(newPassword);

      if (updateError) {
        setError(updateError.message || "Failed to update password.");
        return;
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.5rem",
              background: "#f3f4f6",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1>Settings</h1>
            <p>Manage your account settings</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Content */}
      <div style={{ maxWidth: "600px" }}>
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "white",
            borderRadius: "1rem",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <Settings className="w-5 h-5" style={{ color: "#6366f1" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
              Account Information
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>
                Name
              </span>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#111827", margin: 0 }}>
                {adminProfile?.name || "Admin"}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>
                Email
              </span>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#111827", margin: 0 }}>
                {user?.email || adminProfile?.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "white",
            borderRadius: "1rem",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <Lock className="w-5 h-5" style={{ color: "#6366f1" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
              Change Password
            </h2>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 1rem",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              <Check className="w-4 h-4" />
              Password updated successfully!
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 1rem",
                background: "#fef2f2",
                color: "#991b1b",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}
              >
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: "100%",
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Lock
                  className="w-4 h-4"
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}
              >
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Re-enter your new password"
                  style={{
                    width: "100%",
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Lock
                  className="w-4 h-4"
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-admin-primary"
              style={{ width: "100%" }}
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
