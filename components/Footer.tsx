"use client";

import Link from "next/link";
import {
  Home,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { motion, fadeInUp, staggerContainer } from "@/lib/motion";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "All Properties" },
  { href: "/properties?listing_type=sale", label: "Buy Property" },
  { href: "/properties?listing_type=rent", label: "Rent Property" },
];

const propertyTypes = [
  { href: "/properties?property_type=apartment", label: "Apartments" },
  { href: "/properties?property_type=house", label: "Houses" },
  { href: "/properties?property_type=villa", label: "Villas" },
  { href: "/properties?property_type=commercial", label: "Commercial" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div
          className="footer-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand Section */}
          <motion.div className="footer-brand" variants={fadeInUp}>
            <Link href="/" className="logo">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Home className="w-8 h-8 text-blue-400" />
              </motion.div>
              <span className="logo-text text-white">
                Ghar<span className="text-blue-400">daar</span>24
              </span>
            </Link>
            <p className="footer-description">
              Your trusted partner in finding the perfect home. We connect
              buyers and renters with their dream properties across India.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="social-link"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="footer-section" variants={fadeInUp}>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={link.href}>{link.label}</Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Property Types */}
          <motion.div className="footer-section" variants={fadeInUp}>
            <h4 className="footer-heading">Property Types</h4>
            <ul className="footer-links">
              {propertyTypes.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={link.href}>{link.label}</Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="footer-section" variants={fadeInUp}>
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:info@ghardaar24.com">info@ghardaar24.com</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Mumbai, Maharashtra, India</span>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p>
            &copy; {new Date().getFullYear()} Ghardaar24. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
