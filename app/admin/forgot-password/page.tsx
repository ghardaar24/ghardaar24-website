"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminAuth } from "@/lib/admin-auth";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { requestPasswordReset } = useAdminAuth();

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
    <div className="admin-login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="login-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="login-logo"
            whileHover={{ scale: 1.1, rotate: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/logo.png"
              alt="Ghardaar24"
              width={120}
              height={48}
              className="h-12 w-auto"
            />
          </motion.div>
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "1.5rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {success ? (
          <motion.div
            className="login-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="login-success-icon">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3>Check Your Email</h3>
            <p>
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and click the link to reset your password.
            </p>
            <Link href="/admin/login" className="login-submit mt-6">
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <motion.div
              className="login-field"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email">Email Address</label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="login-submit"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Sending...
                </motion.span>
              ) : (
                "Send Reset Link"
              )}
            </motion.button>
          </form>
        )}

        <motion.p
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/admin/login">← Back to login</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
