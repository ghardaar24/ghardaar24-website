"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  X,
  User,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  title?: string;
  subtitle?: string;
  defaultMode?: "login" | "signup";
}

export default function LoginModal({
  isOpen,
  onClose,
  redirectUrl = "/",
  title,
  subtitle,
  defaultMode = "signup",
}: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    onClose();
    router.push(redirectUrl);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
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
      setSuccess(false);
      setMode("login");
      // Reset signup fields
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
    }, 2000);
    setLoading(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError("");
    setPassword("");
  };

  const getTitle = () => {
    if (title) return title;
    return mode === "signup" ? "Create Account" : "Welcome Back";
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    return mode === "signup"
      ? "Sign up to explore premium properties"
      : "Login to continue browsing properties";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="login-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="login-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <button className="login-modal-close" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>

            <div className="login-modal-header">
              <Link href="/" className="login-modal-logo">
                <Image
                  src="/logo2.png"
                  alt="Ghardaar24"
                  width={140}
                  height={56}
                  className="login-modal-logo-img"
                />
              </Link>
              <h2 className="login-modal-title">{getTitle()}</h2>
              <p className="login-modal-subtitle">{getSubtitle()}</p>
            </div>

            {/* Mode Toggle */}
            <div className="login-modal-toggle">
              <button
                type="button"
                className={`login-modal-toggle-btn ${
                  mode === "signup" ? "active" : ""
                }`}
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={`login-modal-toggle-btn ${
                  mode === "login" ? "active" : ""
                }`}
                onClick={() => switchMode("login")}
              >
                Login
              </button>
            </div>

            {success ? (
              <motion.div
                className="login-modal-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="login-modal-success-icon">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h3>Account Created!</h3>
                <p>
                  Please check your email to verify your account, then login.
                </p>
              </motion.div>
            ) : mode === "signup" ? (
              <form onSubmit={handleSignupSubmit} className="login-modal-form">
                <div className="login-modal-input-group">
                  <label htmlFor="modal-name">Full Name</label>
                  <div className="login-modal-input-wrapper">
                    <User className="login-modal-input-icon" />
                    <input
                      id="modal-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="login-modal-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="login-modal-input-group">
                  <label htmlFor="modal-phone">Phone Number</label>
                  <div className="login-modal-input-wrapper">
                    <Phone className="login-modal-input-icon" />
                    <input
                      id="modal-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="login-modal-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="login-modal-input-group">
                  <label htmlFor="modal-email">Email Address</label>
                  <div className="login-modal-input-wrapper">
                    <Mail className="login-modal-input-icon" />
                    <input
                      id="modal-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="login-modal-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="login-modal-input-group">
                  <label htmlFor="modal-signup-password">Password</label>
                  <div className="login-modal-input-wrapper">
                    <Lock className="login-modal-input-icon" />
                    <input
                      id="modal-signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8+ chars with uppercase, lowercase, and number"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-modal-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="login-modal-password-toggle"
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
                    className="login-modal-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="login-modal-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="login-modal-loading">
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="login-modal-footer-text">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="login-modal-link"
                    onClick={() => switchMode("login")}
                  >
                    Login here
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="login-modal-form">
                <div className="login-modal-input-group">
                  <label htmlFor="modal-emailOrPhone">
                    Email or Phone Number
                  </label>
                  <div className="login-modal-input-wrapper">
                    <Mail className="login-modal-input-icon" />
                    <input
                      id="modal-emailOrPhone"
                      type="text"
                      placeholder="Enter email or phone number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="login-modal-input"
                      disabled={loading}
                    />
                  </div>
                  <span className="login-modal-input-hint">
                    <Phone className="w-3 h-3" />
                    You can login with your registered phone number
                  </span>
                </div>

                <div className="login-modal-input-group">
                  <label htmlFor="modal-password">Password</label>
                  <div className="login-modal-input-wrapper">
                    <Lock className="login-modal-input-icon" />
                    <input
                      id="modal-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-modal-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="login-modal-password-toggle"
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
                  <Link
                    href="/auth/forgot-password"
                    className="login-modal-forgot-link"
                    onClick={onClose}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {error && (
                  <motion.div
                    className="login-modal-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="login-modal-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="login-modal-loading">Signing in...</span>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="login-modal-footer-text">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="login-modal-link"
                    onClick={() => switchMode("signup")}
                  >
                    Sign up here
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
