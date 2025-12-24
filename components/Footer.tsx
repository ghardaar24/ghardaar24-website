"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, User, Building2, FileCheck, CreditCard, Hash } from "lucide-react";
import { motion, fadeInUp, staggerContainer } from "@/lib/motion";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "All Properties" },
  { href: "/properties?listing_type=sale", label: "Buy Property" },
  { href: "/properties?listing_type=rent", label: "Rent Property" },
  { href: "/properties?listing_type=resale", label: "Resale Property" },
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
          className="footer-grid footer-grid-5"
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
                  src="/logo2.png"
                  alt="Ghardaar24"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </motion.div>
            </Link>
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
                <Phone className="w-4 h-4 text-[#B68D40]" />
                <a href="tel:+919673655631">+91 96736 55631</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Phone className="w-4 h-4 text-[#B68D40]" />
                <a href="tel:+919423565760">+91 94235 65760</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Mail className="w-4 h-4 text-[#B68D40]" />
                <a href="mailto:ghardaar24@gmail.com">ghardaar24@gmail.com</a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <MapPin className="w-4 h-4 text-[#B68D40]" />
                <span>Shree Ganesh Heights, Viddya Valley Road, Sus, Pune - 411021</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* CP Details */}
          <motion.div className="footer-section footer-cp-details" variants={fadeInUp}>
            <h4 className="footer-heading">CP Details</h4>
            <ul className="footer-contact footer-contact-dense">
              <li>
                <User className="w-4 h-4 text-[#B68D40]" />
                <span><strong>CP Name:</strong> Sanket Balwant Hire</span>
              </li>
              <li>
                <Building2 className="w-4 h-4 text-[#B68D40]" />
                <span><strong>Firm:</strong> Ghardaar24 (Proprietorship)</span>
              </li>
              <li>
                <FileCheck className="w-4 h-4 text-[#B68D40]" />
                <span><strong>RERA No:</strong> A31262500989</span>
              </li>
              <li>
                <CreditCard className="w-4 h-4 text-[#B68D40]" />
                <span><strong>PAN:</strong> AIGPH9978Q</span>
              </li>
              <li>
                <Hash className="w-4 h-4 text-[#B68D40]" />
                <span><strong>GST:</strong> NA</span>
              </li>
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
