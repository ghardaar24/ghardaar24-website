"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!emailOrPhone.trim()) {
      setError("Please enter your email or phone number");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(emailOrPhone, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-input-group">
        <label htmlFor="emailOrPhone">Email or Phone Number</label>
        <div className="auth-input-wrapper">
          <Mail className="auth-input-icon" />
          <input
            id="emailOrPhone"
            type="text"
            placeholder="Enter email or phone number"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="auth-input"
            disabled={loading}
          />
        </div>
        <span className="auth-input-hint">
          <Phone className="w-3 h-3" />
          You can login with your registered phone number
        </span>
      </div>

      <div className="auth-input-group">
        <label htmlFor="password">Password</label>
        <div className="auth-input-wrapper">
          <Lock className="auth-input-icon" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

      {error && (
        <motion.div
          className="auth-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? (
          <span className="auth-loading">Signing in...</span>
        ) : (
          <>
            Login
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="auth-footer-text">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="auth-link">
          Sign up here
        </Link>
      </p>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div className="auth-form">
      <div className="auth-input-group">
        <label>Email or Phone Number</label>
        <div className="auth-input-wrapper">
          <input
            type="text"
            placeholder="Enter email or phone number"
            className="auth-input"
            disabled
            style={{ paddingLeft: "3rem" }}
          />
        </div>
      </div>
      <div className="auth-input-group">
        <label>Password</label>
        <div className="auth-input-wrapper">
          <input
            type="password"
            placeholder="Enter your password"
            className="auth-input"
            disabled
            style={{ paddingLeft: "3rem" }}
          />
        </div>
      </div>
      <button className="auth-submit-btn" disabled>
        Login
      </button>
    </div>
  );
}

export default function LoginPage() {
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
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
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
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Login to access exclusive property listings
            </p>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
