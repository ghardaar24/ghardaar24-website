"use client";

import { useState, useEffect } from "react";
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

  // Reset fields when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

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
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Content */}
            <div className="pt-8 pb-6 px-8 text-center bg-gradient-to-b from-orange-50/50 to-transparent">
              <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo2.png"
                  alt="Ghardaar24"
                  width={140}
                  height={56}
                  className="h-10 w-auto"
                />
              </Link>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">{getTitle()}</h2>
              <p className="text-gray-500 text-sm">{getSubtitle()}</p>
            </div>

            {/* Mode Toggle */}
            <div className="px-8 mb-6">
              <div className="flex p-1 bg-gray-100 rounded-xl relative">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    left: mode === "signup" ? "4px" : "calc(50%)",
                  }}
                />
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium relative z-10 transition-colors ${
                    mode === "signup" ? "text-gray-900" : "text-gray-500"
                  }`}
                  onClick={() => switchMode("signup")}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium relative z-10 transition-colors ${
                    mode === "login" ? "text-gray-900" : "text-gray-500"
                  }`}
                  onClick={() => switchMode("login")}
                >
                  Login
                </button>
              </div>
            </div>

            {/* Scrollable Form Area */}
            <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {success ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-inner ring-4 ring-green-50">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h3>
                  <p className="text-gray-600">
                    Please check your email to verify your account, then login.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={mode === "signup" ? handleSignupSubmit : handleLoginSubmit}
                  className="space-y-5"
                >
                  {mode === "signup" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors z-10" />
                      <input
                            type="text"
                            placeholder="Type your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            className="w-full !pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-orange-100 transition-all outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-3.5 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors z-10" />
                          <input
                            type="tel"
                            placeholder="Your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                            className="w-full !pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-orange-100 transition-all outline-none text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">
                      {mode === "login" ? "Email or Phone" : "Email Address"}
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors z-10" />
                      <input
                        type={mode === "login" ? "text" : "email"}
                        placeholder={mode === "login" ? "user@example.com" : "Type your email"}
                        value={mode === "login" ? emailOrPhone : email}
                        onChange={(e) =>
                          mode === "login"
                            ? setEmailOrPhone(e.target.value)
                            : setEmail(e.target.value)
                        }
                        disabled={loading}
                        className="w-full !pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-orange-100 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors z-10" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full !pl-11 !pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-orange-100 transition-all outline-none text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {mode === "login" && (
                      <div className="flex justify-end">
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs font-medium text-gray-500 hover:text-[var(--primary)] transition-colors"
                          onClick={onClose}
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="group relative w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:to-[var(--primary)] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    disabled={loading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       {loading ? (
                         "Processing..."
                       ) : (
                         <>
                           {mode === "login" ? "Login" : "Create Account"}
                           <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </>
                       )}
                    </span>
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    {mode === "signup" ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-[var(--primary)] font-semibold hover:underline"
                          onClick={() => switchMode("login")}
                        >
                          Login
                        </button>
                      </>
                    ) : (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          className="text-[var(--primary)] font-semibold hover:underline"
                          onClick={() => switchMode("signup")}
                        >
                          Sign Up
                        </button>
                      </>
                    )}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
