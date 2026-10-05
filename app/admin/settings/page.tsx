"use client";

import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { motion } from "@/lib/motion";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageHeader from "@/components/admin/PageHeader";

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
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your account details."
      />

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
            border: "1px solid var(--color-gray-200)",
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
            <Settings className="w-5 h-5" style={{ color: "var(--color-indigo-500)" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
              Account Information
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                Name
              </span>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-gray-900)", margin: 0 }}>
                {adminProfile?.name || "Admin"}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", textTransform: "uppercase" }}>
                Email
              </span>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-gray-900)", margin: 0 }}>
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
            border: "1px solid var(--color-gray-200)",
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
            <Lock className="w-5 h-5" style={{ color: "var(--color-indigo-500)" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
              Change Password
            </h2>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: "1rem" }}
            >
              <Alert
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  borderColor: "#dcfce7",
                }}
              >
                <Check className="w-4 h-4" />
                <AlertDescription style={{ color: "#166534" }}>
                  Password updated successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: "1rem" }}
            >
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: "1rem" }}>
              <Label style={{ display: "block", marginBottom: "0.375rem", color: "var(--color-gray-700)" }}>
                New Password
              </Label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="pl-10 pr-10"
                  style={{
                    width: "100%",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    height: "auto",
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
                    color: "var(--color-gray-400)",
                    pointerEvents: "none",
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: "0.375rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                  }}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "var(--color-gray-400)" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "var(--color-gray-400)" }} />
                  )}
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <Label style={{ display: "block", marginBottom: "0.375rem", color: "var(--color-gray-700)" }}>
                Confirm New Password
              </Label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Re-enter your new password"
                  className="pl-10 pr-10"
                  style={{
                    width: "100%",
                    paddingTop: "0.625rem",
                    paddingBottom: "0.625rem",
                    height: "auto",
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
                    color: "var(--color-gray-400)",
                    pointerEvents: "none",
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "0.375rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "var(--color-gray-400)" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "var(--color-gray-400)" }} />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="btn-admin-primary"
              style={{ width: "100%" }}
            >
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
