"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Landmark,
  ShieldCheck,
  FileText,
  HandshakeIcon,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  BadgePercent,
  Calculator,
  Users,
  Building,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: BadgePercent,
    title: "Lowest Interest Rates",
    description:
      "We negotiate with multiple banks to get you the most competitive interest rates in the market, saving you lakhs over your loan tenure.",
  },
  {
    icon: FileText,
    title: "Minimal Documentation",
    description:
      "Our experts handle all paperwork efficiently. We only ask for essential documents, making the process hassle-free for you.",
  },
  {
    icon: Clock,
    title: "Quick Approval",
    description:
      "With our pre-verified properties and strong banking relationships, get your loan approved in as little as 7 working days.",
  },
  {
    icon: Users,
    title: "Dedicated Relationship Manager",
    description:
      "A personal loan expert guides you through every step, from application to disbursement, ensuring a smooth experience.",
  },
  {
    icon: Calculator,
    title: "Free EMI Calculation",
    description:
      "Get accurate EMI calculations and understand your repayment schedule before committing to any loan.",
  },
  {
    icon: ShieldCheck,
    title: "100% Transparency",
    description:
      "No hidden charges or surprises. We disclose all fees upfront so you can make informed decisions.",
  },
];

const bankPartners = [
  { name: "State Bank of India", rate: "8.50%" },
  { name: "HDFC Bank", rate: "8.70%" },
  { name: "ICICI Bank", rate: "8.75%" },
  { name: "Axis Bank", rate: "8.75%" },
  { name: "Kotak Mahindra Bank", rate: "8.85%" },
  { name: "Bank of Baroda", rate: "8.40%" },
  { name: "Punjab National Bank", rate: "8.45%" },
  { name: "LIC Housing Finance", rate: "8.50%" },
];

const loanFeatures = [
  { label: "Interest Rate", value: "From 8.35% p.a.", highlight: true },
  { label: "Loan Tenure", value: "Up to 30 years", highlight: false },
  { label: "Processing Fee", value: "0.25% - 0.50%", highlight: false },
  { label: "Loan Amount", value: "Up to ₹5 Crore", highlight: true },
  { label: "Prepayment", value: "No penalty*", highlight: false },
  { label: "Approval Time", value: "7-10 days", highlight: false },
];

const eligibility = [
  "Salaried individuals with minimum 2 years work experience",
  "Self-employed professionals with 3+ years in business",
  "Age between 21-60 years at loan maturity",
  "Minimum monthly income of ₹25,000",
  "Good credit score (650+)",
  "Properties in approved locations",
];

const documents = [
  {
    category: "Identity Proof",
    items: ["Aadhaar Card", "PAN Card", "Passport"],
  },
  {
    category: "Address Proof",
    items: ["Utility Bills", "Rent Agreement", "Aadhaar Card"],
  },
  {
    category: "Income Proof",
    items: ["Salary Slips (3 months)", "Bank Statements (6 months)", "Form 16"],
  },
  {
    category: "Property Documents",
    items: ["Sale Agreement", "Title Deeds", "NOC from Society"],
  },
];

const processSteps = [
  {
    step: "01",
    title: "Apply Online",
    description:
      "Fill out our simple online form or call us. Our team will get in touch within 2 hours.",
  },
  {
    step: "02",
    title: "Document Collection",
    description:
      "Our representative visits your location to collect documents at your convenience.",
  },
  {
    step: "03",
    title: "Loan Processing",
    description:
      "We submit your application to multiple banks and negotiate the best rates for you.",
  },
  {
    step: "04",
    title: "Approval & Disbursement",
    description:
      "Once approved, the loan amount is disbursed directly to the seller's account.",
  },
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="service-hero-icon">
              <Landmark className="w-12 h-12" />
            </div>
            <h1 className="service-hero-title">Home Loan Assistance</h1>
            <p className="service-hero-subtitle">
              Your dream home deserves the best financing. We partner with
              India&apos;s top banks to get you the lowest interest rates, quick
              approvals, and a completely hassle-free experience. Let our
              experts handle everything while you focus on finding your perfect
              home.
            </p>
            <div className="service-hero-cta">
              <Link href="#contact" className="btn-primary">
                Get Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/properties" className="btn-secondary">
                Browse Properties
              </Link>
            </div>
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
            <span className="section-label">Loan Highlights</span>
            <h2 className="section-title-new">
              Attractive Loan Features for You
            </h2>
          </motion.div>

          <motion.div
            className="loan-features-grid"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {loanFeatures.map((feature) => (
              <div
                key={feature.label}
                className={`loan-feature-card ${
                  feature.highlight ? "highlight" : ""
                }`}
              >
                <span className="loan-feature-value">{feature.value}</span>
                <span className="loan-feature-label">{feature.label}</span>
              </div>
            ))}
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
            <span className="section-label">Why Choose Ghardaar24</span>
            <h2 className="section-title-new">
              Benefits of Our Home Loan Service
            </h2>
            <p className="section-subtitle">
              We go above and beyond to make your home financing journey smooth
              and stress-free
            </p>
          </motion.div>

          <motion.div
            className="service-benefits-grid extended"
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

      {/* Process Section */}
      <section className="service-process">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Simple Process</span>
            <h2 className="section-title-new">How It Works</h2>
            <p className="section-subtitle">
              Get your home loan approved in 4 simple steps
            </p>
          </motion.div>

          <motion.div
            className="process-steps"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {processSteps.map((item) => (
              <motion.div
                key={item.step}
                className="process-step-card"
                variants={fadeInUp}
              >
                <span className="process-step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Eligibility & Documents */}
      <section className="service-eligibility">
        <div className="container">
          <div className="eligibility-grid">
            <motion.div
              className="eligibility-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3>
                <Users className="w-6 h-6" /> Eligibility Criteria
              </h3>
              <ul>
                {eligibility.map((item) => (
                  <li key={item}>
                    <CheckCircle className="w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="documents-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3>
                <FileText className="w-6 h-6" /> Documents Required
              </h3>
              <div className="documents-list">
                {documents.map((doc) => (
                  <div key={doc.category} className="document-category">
                    <h4>{doc.category}</h4>
                    <ul>
                      {doc.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
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
              We work with India&apos;s leading banks and NBFCs to get you the
              best rates
            </p>
          </motion.div>

          <motion.div
            className="partners-grid extended"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {bankPartners.map((bank) => (
              <div key={bank.name} className="partner-card with-rate">
                <Building className="w-8 h-8" />
                <span className="partner-name">{bank.name}</span>
                <span className="partner-rate">From {bank.rate}</span>
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
              <h2>Ready to Finance Your Dream Home?</h2>
              <p>
                Our home loan experts are ready to help you find the best
                financing options. Get a free consultation and personalized rate
                quote today. No obligations, no hidden fees.
              </p>
            </div>
            <div className="service-contact-cta">
              <a href="tel:+919876543210" className="btn-primary">
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi, I'm interested in home loan assistance from Ghardaar24"
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
