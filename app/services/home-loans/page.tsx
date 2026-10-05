"use client";

import { useState } from "react";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  ShieldCheck,
  FileText,
  Phone,
  ArrowRight,
  Check,
  Clock,
  BadgePercent,
  Calculator,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";
import { formatPrice } from "@/lib/utils";

const benefits = [
  {
    icon: BadgePercent,
    title: "Lower interest rates",
    description:
      "We put your file in front of several banks at once and push for the lowest rate. Half a percent less saves lakhs over 20 years.",
  },
  {
    icon: FileText,
    title: "Less paperwork",
    description:
      "We tell you exactly which documents your bank needs, check them before they go in, and file them for you.",
  },
  {
    icon: Clock,
    title: "Approval in about 7 working days",
    description:
      "Verified properties and long-standing bank contacts mean fewer back-and-forth queries on your file.",
  },
  {
    icon: Users,
    title: "One person from start to finish",
    description:
      "A single relationship manager handles your loan from application to disbursement. You always know who to call.",
  },
  {
    icon: Calculator,
    title: "EMI worked out upfront",
    description:
      "See your monthly EMI and total interest before you sign anything, for every offer you receive.",
  },
  {
    icon: ShieldCheck,
    title: "Every fee disclosed",
    description:
      "Processing fees, legal charges and insurance are listed before you commit. Nothing turns up later.",
  },
];

const eligibility = [
  "Salaried, with at least 2 years of work experience",
  "Self-employed, with at least 3 years in business",
  "Aged 21–60 at the end of the loan term",
  "Monthly income of ₹25,000 or more",
  "Credit score of 650 or higher",
  "Property in a bank-approved location",
];

const documents = [
  {
    category: "Identity",
    items: ["Aadhaar card", "PAN card", "Passport"],
  },
  {
    category: "Address",
    items: ["Utility bills", "Rent agreement", "Aadhaar card"],
  },
  {
    category: "Income",
    items: ["Salary slips (3 months)", "Bank statements (6 months)", "Form 16"],
  },
  {
    category: "Property",
    items: ["Sale agreement", "Title deeds", "NOC from society"],
  },
];

const processSteps = [
  {
    title: "Tell us what you need",
    description:
      "Fill in the form or call us. We get back to you within 2 hours.",
  },
  {
    title: "We collect your documents",
    description:
      "Our representative picks up your documents from home or office, at a time that suits you.",
  },
  {
    title: "Banks compete for your file",
    description:
      "We send your application to several banks and negotiate the rate and fees.",
  },
  {
    title: "Sanction and disbursement",
    description:
      "Once approved, the bank pays the seller directly. You get the keys.",
  },
];

const banks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "LIC HFL"];

function calcEmi(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return { emi, interest: emi * n - principal };
}

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function SanctionSlip() {
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const { emi, interest } = calcEmi(amount, rate, years);
  const interestShare = interest / (interest + amount);

  return (
    <motion.div
      className="hlx-slip"
      initial={{ opacity: 0, y: 24, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hlx-slip-head">
        <span>Home loan · EMI estimate</span>
      </div>

      <div className="hlx-slip-emi">
        <span className="hlx-slip-label">Your monthly EMI</span>
        <output className="hlx-slip-emi-value" aria-live="polite">
          {rupees(emi)}
        </output>
      </div>

      <div className="hlx-slip-fields">
        <label className="hlx-field">
          <span className="hlx-field-row">
            <span>Loan amount</span>
            <strong>{formatPrice(amount)}</strong>
          </span>
          <input
            type="range"
            min={1000000}
            max={30000000}
            step={100000}
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
          />
        </label>
        <label className="hlx-field">
          <span className="hlx-field-row">
            <span>Interest rate</span>
            <strong>{rate.toFixed(2)}%</strong>
          </span>
          <input
            type="range"
            min={7}
            max={12}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
          />
        </label>
        <label className="hlx-field">
          <span className="hlx-field-row">
            <span>Tenure</span>
            <strong>{years} years</strong>
          </span>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(+e.target.value)}
          />
        </label>
      </div>

      <div className="hlx-slip-split">
        <div
          className="hlx-slip-bar"
          role="img"
          aria-label={`${Math.round(interestShare * 100)}% of what you repay is interest`}
        >
          <span style={{ width: `${(1 - interestShare) * 100}%` }} />
        </div>
        <dl>
          <div>
            <dt>Principal</dt>
            <dd>{formatPrice(amount)}</dd>
          </div>
          <div>
            <dt>Total interest</dt>
            <dd className="is-interest">{formatPrice(interest)}</dd>
          </div>
        </dl>
      </div>

      <span className="hlx-stamp" aria-hidden="true">
        Estimate
      </span>
    </motion.div>
  );
}

const loanStats = [
  { value: "₹0", label: "Consultation fee" },
  { value: "6", label: "Banks compared for you" },
  { value: "7 days", label: "Approval, in as little as" },
  { value: "2 hrs", label: "Callback after you apply" },
];

export default function HomeLoansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="hlx-page">
        {/* Hero — same dusk shell as the landing page */}
        <section className="hero-v2 hlx-hero">
          <div className="container hero-v2-container">
            <div className="hero-v2-content">
              <p className="hero-v2-eyebrow">Home loans · Pune</p>
              <h1 className="hero-v2-heading">
                <span>Six banks quote.</span>
                <em>You sign the lowest.</em>
              </h1>
              <p className="hero-v2-sub">
                We don&apos;t sell you a loan. We take your file to six lenders,
                compare their rates and fees, and bring back the cheapest
                sanction for your profile.
              </p>
              <div className="hero-v2-cta-group">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hero-v2-btn-primary"
                >
                  Get a free consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a href="tel:+919673655631" className="hero-v2-btn-ghost">
                  <Phone className="w-5 h-5" />
                  Call us
                </a>
              </div>
              <p className="hero-v2-areas-label" id="hlx-banks-label">
                Banks we compare
              </p>
              <ul className="hero-v2-areas hlx-banks" aria-labelledby="hlx-banks-label">
                {banks.map((bank) => (
                  <li key={bank}>{bank}</li>
                ))}
              </ul>
            </div>

            <div className="hlx-hero-art">
              <Image
                src="/homeloan.png"
                alt=""
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="hlx-hero-img"
              />
              <SanctionSlip />
            </div>
          </div>
        </section>

        {/* Trust strip — reuses the landing page's */}
        <section className="trust-v2">
          <div className="container">
            <dl className="trust-v2-list">
              {loanStats.map((stat) => (
                <div key={stat.label} className="trust-v2-item">
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Benefits */}
        <section className="hlx-section">
          <div className="container hlx-split">
            <div className="hlx-split-head">
              <span className="featured-v2-eyebrow">What we do for you</span>
              <h2 className="featured-v2-title">
                A loan advisor <em>on your side.</em>
              </h2>
              <p className="hlx-body">
                A bank&apos;s loan officer works for the bank. We work for you,
                comparing every offer before you commit to one.
              </p>
            </div>

            <motion.ul
              className="hlx-benefits"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {benefits.map((b) => (
                <motion.li key={b.title} variants={fadeInUp}>
                  <span className="hlx-benefit-icon">
                    <b.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* Process: a real sequence, so the steps are numbered */}
        <section className="hlx-section hlx-section--dusk">
          <div className="container">
            <span className="hero-v2-eyebrow">How it works</span>
            <h2 className="featured-v2-title hlx-title-light">
              From first call <em>to keys.</em>
            </h2>

            <motion.ol
              className="hlx-route"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {processSteps.map((s, i) => (
                <motion.li key={s.title} variants={fadeInUp}>
                  <span className="hlx-route-dot">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* Eligibility & documents */}
        <section className="hlx-section">
          <div className="container">
            <span className="featured-v2-eyebrow">Before you apply</span>
            <h2 className="featured-v2-title">
              Check you qualify, <em>then gather these.</em>
            </h2>

            <div className="hlx-ready">
              <div className="hlx-elig">
                <h3>Eligibility</h3>
                <ul>
                  {eligibility.map((item) => (
                    <li key={item}>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hlx-docs">
                <h3>Documents</h3>
                <div className="hlx-docs-grid">
                  {documents.map((doc) => (
                    <div key={doc.category} className="hlx-doc">
                      <span className="hlx-doc-tab">{doc.category}</span>
                      <ul>
                        {doc.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA — the landing page's saffron band */}
        <section id="contact" className="cta-v2">
          <div className="container cta-v2-inner">
            <h2 className="cta-v2-title">
              Found the home?
              <em>Let&apos;s fund it.</em>
            </h2>
            <div className="cta-v2-buttons">
              <button
                onClick={() => setIsModalOpen(true)}
                className="cta-v2-btn-primary"
              >
                Get a free consultation
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/properties" className="cta-v2-btn-outline">
                Browse properties
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <ConsultationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="home_loan"
      />
    </>
  );
}
