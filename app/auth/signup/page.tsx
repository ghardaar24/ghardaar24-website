"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  MapPin,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { INDIAN_STATES_CITIES } from "@/lib/indian-cities";

function SignupForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNri, setIsNri] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

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

    if (isNri) {
      if (!country.trim()) {
        setError("Please enter your country");
        setLoading(false);
        return;
      }
      if (!state.trim()) {
        setError("Please enter your state");
        setLoading(false);
        return;
      }
      if (!city.trim()) {
        setError("Please enter your city");
        setLoading(false);
        return;
      }
    } else {
      if (!state.trim()) {
        setError("Please select your state");
        setLoading(false);
        return;
      }
      if (!city.trim()) {
        setError("Please select your city");
        setLoading(false);
        return;
      }
    }

    const { error: signUpError } = await signUp(
      name,
      phone,
      email,
      password,
      {
        isNri,
        country: isNri ? country : "India",
        state,
        city,
      }
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
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
        <Link href="/auth/login" className="auth-submit-btn" style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Continue to Login
          <ArrowRight className="w-5 h-5" />
        </Link>
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

      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4 mb-4">
        <div className="auth-input-group">
          <label htmlFor="residency" className="text-sm font-medium text-gray-700 mb-1 block">
            Residency Status
          </label>
          <div className="auth-input-wrapper">
            <Globe className="auth-input-icon" />
            <select
              id="residency"
              value={isNri ? "nri" : "indian"}
              onChange={(e) => {
                const isNriValue = e.target.value === "nri";
                setIsNri(isNriValue);
                // Clear fields on change
                setCountry("");
                setState("");
                setCity("");
              }}
              className="auth-input text-sm appearance-none bg-transparent"
              disabled={loading}
              style={{ backgroundImage: 'none' }}
            >
              <option value="indian">Indian Citizen</option>
              <option value="nri">NRI (Non-Resident Indian)</option>
            </select>
          </div>
        </div>

        {isNri ? (
          <>
            <div className="auth-input-group">
              <label htmlFor="country" className="text-xs text-gray-500 mb-1 block">
                Country
              </label>
              <div className="auth-input-wrapper">
                <Globe className="auth-input-icon" />
                <input
                  id="country"
                  type="text"
                  placeholder="Enter your country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="auth-input text-sm"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="auth-input-group">
                <label htmlFor="state" className="text-xs text-gray-500 mb-1 block">
                  State
                </label>
                <div className="auth-input-wrapper">
                  <MapPin className="auth-input-icon" />
                  <input
                    id="state"
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="auth-input text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="auth-input-group">
                <label htmlFor="city" className="text-xs text-gray-500 mb-1 block">
                  City
                </label>
                <div className="auth-input-wrapper">
                  <MapPin className="auth-input-icon" />
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="auth-input text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="auth-input-group">
              <label htmlFor="state" className="text-xs text-gray-500 mb-1 block">
                State
              </label>
              <div className="auth-input-wrapper">
                <MapPin className="auth-input-icon" />
                <select
                  id="state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setCity(""); // Reset city when state changes
                  }}
                  className="auth-input text-sm appearance-none bg-transparent"
                  disabled={loading}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Select State</option>
                  {Object.keys(INDIAN_STATES_CITIES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="auth-input-group">
              <label htmlFor="city" className="text-xs text-gray-500 mb-1 block">
                City
              </label>
              <div className="auth-input-wrapper">
                <MapPin className="auth-input-icon" />
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="auth-input text-sm appearance-none bg-transparent"
                  disabled={loading || !state}
                   style={{ backgroundImage: 'none' }}
                >
                  <option value="">Select City</option>
                  {state &&
                    INDIAN_STATES_CITIES[state]?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="auth-input-group">
        <label htmlFor="password">Password</label>
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
