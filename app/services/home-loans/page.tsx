"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Landmark,
  ShieldCheck,
  FileText,
  HandshakeIcon,
  Phone,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Lowest Interest Rates",
    description: "Access competitive rates from multiple banking partners",
  },
  {
    icon: FileText,
    title: "Minimal Documentation",
    description: "Simplified paperwork with our expert guidance",
  },
  {
    icon: HandshakeIcon,
    title: "Quick Approval",
    description: "Fast-track your loan approval with pre-verified properties",
  },
];

const bankPartners = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Bank of Baroda",
];

const loanFeatures = [
  { label: "Interest Rate", value: "From 8.35% p.a." },
  { label: "Loan Tenure", value: "Up to 30 years" },
  { label: "Processing Fee", value: "Minimal charges" },
  { label: "Loan Amount", value: "Up to ₹5 Crore" },
];

export default function HomeLoansPage() {
  return (
    <main className="service-page">
      {/* Hero Section */}
      <section className="service-hero">
        <div className="container">
          <motion.div
            className="service-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="service-hero-icon">
              <Landmark className="w-12 h-12" />
            </div>
            <h1 className="service-hero-title">Home Loan Assistance</h1>
            <p className="service-hero-subtitle">
              Get the best home loan rates with our trusted banking partners. We
              help you secure financing for your dream home with quick approvals
              and minimal documentation.
            </p>
            <div className="service-hero-cta">
              <Link href="#contact" className="btn-primary">
                Get a Callback
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/properties" className="btn-secondary">
                Explore Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="service-benefits">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title-new">
              Benefits of Our Home Loan Service
            </h2>
          </motion.div>

          <motion.div
            className="service-benefits-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                className="service-benefit-card"
                variants={fadeInUp}
              >
                <div className="service-benefit-icon">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Loan Features */}
      <section className="service-features-section">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-new">Loan Features</h2>
          </motion.div>

          <motion.div
            className="loan-features-grid"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {loanFeatures.map((feature) => (
              <div key={feature.label} className="loan-feature-card">
                <span className="loan-feature-value">{feature.value}</span>
                <span className="loan-feature-label">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bank Partners */}
      <section className="service-partners">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Our Partners</span>
            <h2 className="section-title-new">Trusted Banking Partners</h2>
            <p className="section-subtitle">
              We work with India&apos;s leading banks to get you the best rates
            </p>
          </motion.div>

          <motion.div
            className="partners-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {bankPartners.map((bank) => (
              <div key={bank} className="partner-card">
                <Landmark className="w-8 h-8" />
                <span>{bank}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="service-contact">
        <div className="container">
          <motion.div
            className="service-contact-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="service-contact-content">
              <h2>Ready to Get Started?</h2>
              <p>
                Our home loan experts are ready to help you find the best
                financing options. Get a free consultation today.
              </p>
            </div>
            <div className="service-contact-cta">
              <a href="tel:+919876543210" className="btn-primary">
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi, I'm interested in home loan assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
