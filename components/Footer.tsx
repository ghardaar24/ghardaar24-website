"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { motion, fadeInUp, staggerContainer } from "@/lib/motion";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "All Properties" },
  { href: "/properties?listing_type=sale", label: "Buy Property" },
  { href: "/properties?listing_type=rent", label: "Rent Property" },
  { href: "/calculators", label: "Calculators" },
  { href: "/real-estate-guide", label: "Real Estate Guide" },
  { href: "/downloads", label: "Downloads" },
];

const propertyTypes = [
  { href: "/properties?property_type=apartment", label: "Apartments" },
  { href: "/properties?property_type=house", label: "Houses" },
  { href: "/properties?property_type=villa", label: "Villas" },
  { href: "/properties?property_type=commercial", label: "Commercial" },
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
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/logo3.png"
                  alt="Ghardaar24"
                  width={120}
                  height={40}
                  style={{ height: "40px", width: "auto" }}
                />
              </motion.div>
            </Link>
            <p className="footer-rera">RERA No: A31262500989</p>
            <p className="footer-description">
              Your trusted partner in finding the perfect home. We connect
              buyers and renters with their dream properties across India.
            </p>
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
                <Phone className="w-4 h-4 text-[--primary]" />
                <a href="tel:+919673655631">+91 96736 55631</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Mail className="w-4 h-4 text-[--primary]" />
                <a href="mailto:ghardaar24@gmail.com">ghardaar24@gmail.com</a>
              </motion.li>
            </ul>
            <div className="footer-social">
              <h4 className="footer-heading" style={{ marginTop: "1.5rem" }}>
                Follow Us
              </h4>
              <div className="social-links">
                <motion.a
                  href="https://www.instagram.com/ghardaar24"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="social-link instagram"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/share/1BsxSR87Pm/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                  className="social-link facebook"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="https://www.youtube.com/channel/UCGZv7IVyfV61fH_mq1O4WHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="social-link youtube"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
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
