"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  Plus,
  LayoutDashboard,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStaffAuth } from "@/lib/staff-auth";
import {
  motion,
  AnimatePresence,
  staggerContainer,
  fadeInDown,
  menuSlide,
} from "@/lib/motion";

const propertyDropdownLinks = [
  { href: "/properties?listing_type=sale", label: "Buy" },
  { href: "/properties?listing_type=rent", label: "Rent" },
  { href: "/properties?listing_type=resale", label: "Resale" },
];

const resourcesDropdownLinks = [
  { href: "/calculators", label: "All Calculators", isHeader: true },
  { href: "/calculators#emi", label: "EMI Calculator", isSubItem: true },
  { href: "/calculators#roi", label: "ROI Calculator", isSubItem: true },
  { href: "/calculators#mortgage", label: "Mortgage Affordability", isSubItem: true },
  { href: "/real-estate-guide", label: "Real Estate Guide" },
];

function HeaderContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, userProfile, isAdmin, loading, signOut } = useAuth();
  const { staffProfile } = useStaffAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <motion.header
      className={`header ${isScrolled ? "scrolled" : ""}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container">
        <nav className="nav">
          <Link href="/" className="logo" id="intro-logo">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo2.png"
                alt="Ghardaar24"
                width={120}
                height={40}
                style={{ height: "40px", width: "auto" }}
              />
            </motion.div>
          </Link>

          <motion.div
            className="nav-links desktop-nav"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Properties Dropdown */}
            <div
              className="nav-dropdown-container"
              id="intro-properties"
              onMouseEnter={() => setIsPropertiesOpen(true)}
              onMouseLeave={() => setIsPropertiesOpen(false)}
            >
              <motion.button
                className="nav-link nav-dropdown-trigger"
                variants={fadeInDown}
                whileHover={{ y: -2 }}
              >
                Properties
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isPropertiesOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isPropertiesOpen && (
                  <motion.div
                    className="nav-dropdown-menu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href="/properties"
                      className="nav-dropdown-item"
                      onClick={() => setIsPropertiesOpen(false)}
                    >
                      All Properties
                    </Link>
                    {propertyDropdownLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="nav-dropdown-item"
                        onClick={() => setIsPropertiesOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Services - wrapped for intro.js */}
            <div id="intro-services" className="flex items-center gap-6">
              {/* Home Loans Link */}
              <motion.div variants={fadeInDown} whileHover={{ y: -2 }}>
                <Link href="/services/home-loans" className="nav-link">
                  Home Loans
                </Link>
              </motion.div>

              {/* Interior Design Link */}
              <motion.div variants={fadeInDown} whileHover={{ y: -2 }}>
                <Link href="/services/interior-design" className="nav-link">
                  Interior Design
                </Link>
              </motion.div>

              {/* Vastu Consultation Link */}
              <motion.div variants={fadeInDown} whileHover={{ y: -2 }}>
                <Link href="/services/vastu-consultation" className="nav-link">
                  Vastu Consultation
                </Link>
              </motion.div>
            </div>

            {/* Resources Dropdown */}
            <div
              className="nav-dropdown-container"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <motion.button
                className="nav-link nav-dropdown-trigger"
                variants={fadeInDown}
                whileHover={{ y: -2 }}
              >
                Resources
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isResourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isResourcesOpen && (
                  <motion.div
                    className="nav-dropdown-menu nav-dropdown-menu-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {resourcesDropdownLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`nav-dropdown-item ${
                          link.isHeader ? "nav-dropdown-header" : ""
                        } ${link.isSubItem ? "nav-dropdown-subitem" : ""}`}
                        onClick={() => setIsResourcesOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="nav-actions">
            {mounted && !loading && (
              <>
                {user ? (
                    <div className="header-user-menu relative" id="intro-user-menu">
                    <motion.button
                      className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white hover:shadow-md transition-all"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm text-gray-700 hidden sm:inline">
                        {userProfile?.name || "User"}
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1 z-50"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          
                          {/* Admin Panel Link */}
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}

                          {/* Staff Panel Link */}
                          {staffProfile && (
                            <Link
                              href="/staff/crm"
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Staff Panel
                            </Link>
                          )}

                          <Link
                            href="/properties/submit"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Plus className="w-4 h-4" />
                            Submit Property
                          </Link>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="header-auth-buttons" id="intro-auth">
                    <Link href="/auth/login" className="header-login-btn">
                      Login
                    </Link>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/auth/signup" className="header-signup-btn">
                        Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </>
            )}

            <motion.button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="mobile-nav"
              variants={menuSlide}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Properties Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/properties"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Properties
                </Link>
              </motion.div>
              {propertyDropdownLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 1) * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="mobile-nav-link mobile-nav-sublink"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Home Loans */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href="/services/home-loans"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home Loans
                </Link>
              </motion.div>

              {/* Interior Design */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/services/interior-design"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Interior Design
                </Link>
              </motion.div>

              {/* Vastu Consultation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 }}
              >
                <Link
                  href="/services/vastu-consultation"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Vastu Consultation
                </Link>
              </motion.div>

              {/* Resources Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="mobile-nav-section"
              >
                <span className="mobile-nav-section-title">Resources</span>
              </motion.div>
              {resourcesDropdownLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`mobile-nav-link mobile-nav-sublink ${
                      link.isSubItem ? "mobile-nav-nested" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile auth links */}
              <div className="mobile-auth-section">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="mobile-nav-link mobile-dashboard-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      My Dashboard
                    </Link>
                    <Link
                      href="/properties/submit"
                      className="mobile-nav-link mobile-submit-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="w-5 h-5" />
                      Submit Property
                    </Link>
                    <div className="mobile-user-info">
                      <User className="w-5 h-5" />
                      <span>{userProfile?.name || "User"}</span>
                    </div>
                    <button
                      className="mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="mobile-nav-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="mobile-nav-link mobile-signup-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export default function Header() {
  return <HeaderContent />;
}
