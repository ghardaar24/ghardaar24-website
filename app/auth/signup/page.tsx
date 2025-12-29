"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

function SignupForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

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

    const { error: signUpError } = await signUp(name, phone, email, password);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  if (success) {
    return (
      <motion.div
        className="auth-success"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-success-icon">
          <CheckCircle className="w-16 h-16" />
        </div>
        <h2>Account Created!</h2>
        <p>Please check your email to verify your account, then login.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-input-group">
        <label htmlFor="name">Full Name</label>
        <div className="auth-input-wrapper">
          <User className="auth-input-icon" />
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-input-group">
        <label htmlFor="phone">Phone Number</label>
        <div className="auth-input-wrapper">
          <Phone className="auth-input-icon" />
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="auth-input"
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-input-group">
        <label htmlFor="email">Email Address</label>
        <div className="auth-input-wrapper">
          <Mail className="auth-input-icon" />
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-input-group">
        <label htmlFor="password">Password</label>
        <div className="auth-input-wrapper">
          <Lock className="auth-input-icon" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="8+ chars with uppercase, lowercase, and number"
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
          <span className="auth-loading">Creating Account...</span>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link href="/auth/login" className="auth-link">
          Login here
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join Ghardaar24 to explore premium properties in Pune
            </p>
          </div>

          <SignupForm />
        </div>
      </motion.div>
    </div>
  );
}
