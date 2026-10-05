"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/staff-auth";
import { motion } from "@/lib/motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import RoleAuthShell from "@/components/RoleAuthShell";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useStaffAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push("/staff/crm");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleAuthShell role="staff">
      <div className="admin-login-page staff-login-page">
        <motion.div
          className="login-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-header">
            <div className="login-logo">
              <Image src="/logo.png" alt="Ghardaar24" width={120} height={48} className="h-12 w-auto" />
            </div>
            <h1>Staff portal</h1>
            <p>Sign in with the email your admin set up for you.</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <Label htmlFor="staff-email">Email address</Label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <Input
                  type="email"
                  id="staff-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-auto"
                />
              </div>
            </div>

            <div className="login-field">
              <Label htmlFor="staff-password">Password</Label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="staff-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-auto"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="login-footer">
            Need an account or lost access? Ask your admin.
          </p>
        </motion.div>
      </div>
    </RoleAuthShell>
  );
}
