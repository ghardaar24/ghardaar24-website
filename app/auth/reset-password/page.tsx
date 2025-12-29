"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Listen for auth state to detect the password recovery session
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (in case the event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate password
    if (
      password.length < 8 ||
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      setError(
        "Password must be 8+ characters with uppercase, lowercase, and number"
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-elements">
        <div className="auth-bg-circle auth-bg-circle-1" />
        <div className="auth-bg-circle auth-bg-circle-2" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          <div className="auth-header">
            <Link href="/" className="auth-logo">
              <Image
                src="/logo2.png"
                alt="Ghardaar24"
                width={160}
                height={64}
                className="auth-logo-img"
              />
            </Link>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Enter your new password below</p>
          </div>

          {success ? (
            <motion.div
              className="auth-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="auth-success-icon">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3>Password Reset Successful!</h3>
              <p>
                Your password has been updated successfully. You can now login
                with your new password.
              </p>
              <Link href="/auth/login" className="auth-submit-btn mt-6">
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : !sessionReady ? (
            <div className="auth-form">
              <div className="auth-error">
                Invalid or expired reset link. Please request a new password
                reset.
              </div>
              <Link href="/auth/forgot-password" className="auth-submit-btn">
                Request New Reset Link
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="password">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars: A-Z, a-z, 0-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-loading">Updating Password...</span>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
