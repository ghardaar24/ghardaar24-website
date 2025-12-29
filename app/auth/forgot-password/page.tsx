"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const { error: resetError } = await requestPasswordReset(email);

    if (resetError) {
      setError(resetError.message);
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
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <Link href="/" className="auth-logo">
              <Image
                src="/logo2.png"
                alt="Ghardaar24"
                width={160}
                height={64}
                className="auth-logo-img"
              />
            </Link>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-subtitle">
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </p>
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
              <h3>Check Your Email</h3>
              <p>
                We&apos;ve sent a password reset link to{" "}
                <strong>{email}</strong>. Please check your inbox and click the
                link to reset your password.
              </p>
              <Link href="/auth/login" className="auth-submit-btn mt-6">
                Back to Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    disabled={loading}
                  />
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
                  <span className="auth-loading">Sending...</span>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="auth-footer-text">
                Remember your password?{" "}
                <Link href="/auth/login" className="auth-link">
                  Login here
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
