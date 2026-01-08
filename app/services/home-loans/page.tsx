"use client";

import { useState } from "react";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Landmark,
  ShieldCheck,
  FileText,
  HandshakeIcon,
  Phone,
  ArrowRight,
  CheckCircle,
  Clock,
  BadgePercent,
  Calculator,
  Users,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";


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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
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
                Your dream home deserves the best financing. We partner with
                India&apos;s top banks to get you the lowest interest rates,
                quick approvals, and a completely hassle-free experience. Let
                our experts handle everything while you focus on finding your
                perfect home.
              </p>
              <div className="service-hero-cta">
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="btn-primary"
                >
                  Get Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/properties" className="btn-secondary">
                  Browse Properties
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
              <span className="section-label">Why Choose Ghardaar24</span>
              <h2 className="section-title-new">
                Benefits of Our Home Loan Service
              </h2>
              <p className="section-subtitle">
                We go above and beyond to make your home financing journey
                smooth and stress-free
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
                  financing options. Get a free consultation and personalized
                  rate quote today. No obligations, no hidden fees.
                </p>
              </div>
              <div className="service-contact-cta">
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="btn-primary"
                >
                  Get Free Consultation
                </button>
                <a href="tel:+919673655631" className="btn-secondary">
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Consultation Form Modal */}
      <ConsultationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="home_loan"
      />
    </>
  );
}

