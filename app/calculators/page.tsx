import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EMICalculator from "@/components/EMICalculator";
import ROICalculator from "@/components/ROICalculator";
import MortgageCalculator from "@/components/MortgageCalculator";

export const metadata: Metadata = {
  title: "Financial Calculators | EMI, ROI & Mortgage | Ghardaar24",
  description:
    "Plan your property investment with our free financial calculators. Calculate EMI, estimate ROI on real estate, and check your mortgage affordability.",
  keywords: [
    "EMI calculator",
    "home loan calculator",
    "ROI calculator",
    "mortgage calculator",
    "property investment",
    "real estate calculator",
    "affordability calculator",
  ],
  openGraph: {
    title: "Financial Calculators | Ghardaar24",
    description:
      "Free EMI, ROI, and Mortgage calculators to plan your property investment.",
    type: "website",
    url: "https://ghardaar24.com/calculators",
  },
  alternates: {
    canonical: "https://ghardaar24.com/calculators",
  },
};

const calculators = [
  {
    id: "mortgage",
    eyebrow: "Start here",
    title: "How much home",
    em: "can you afford?",
    intro:
      "Enter your income and expenses to see the largest loan a bank is likely to approve, and the property price that puts within reach.",
    notes: [
      ["The 45% rule", "Banks usually keep your EMI within about 45% of your take-home pay after expenses."],
      ["Down payment", "Most lenders want 10–20% upfront. A bigger down payment means a smaller EMI."],
    ],
    Calculator: MortgageCalculator,
  },
  {
    id: "emi",
    eyebrow: "Monthly payment",
    title: "What will",
    em: "you pay each month?",
    intro:
      "Your EMI is the fixed amount you pay the bank every month until the loan is repaid. It covers both principal and interest.",
    notes: [
      ["Try the rate", "A rate just half a percent lower saves lakhs over 20 years. Slide it and watch total interest."],
      ["Tenure trade-off", "A longer tenure lowers your EMI but raises the total interest you pay."],
    ],
    Calculator: EMICalculator,
  },
  {
    id: "roi",
    eyebrow: "For investors",
    title: "What could",
    em: "it earn you?",
    intro:
      "Estimate your total return from rent and price growth over the years you plan to hold the property.",
    notes: [
      ["Be conservative", "Appreciation varies a lot by city and neighbourhood. Start with a modest rate."],
      ["Rent isn't profit", "Maintenance, property tax and vacant months reduce what you actually keep."],
    ],
    Calculator: ROICalculator,
  },
];

export default function CalculatorsPage() {
  return (
    <>
      <Header />
      <main className="hlx-page">
        {/* Hero — landing page's dusk shell */}
        <section className="hero-v2">
          <div className="container hero-v2-container">
            <div className="hero-v2-content">
              <p className="hero-v2-eyebrow">Free calculators</p>
              <h1 className="hero-v2-heading">
                <span>Run the numbers</span>
                <em>before you visit.</em>
              </h1>
              <p className="hero-v2-sub">
                Work out what you can afford, what your EMI will be, and what a
                property could earn you. No sign-up, nothing saved.
              </p>
              <p className="hero-v2-areas-label" id="rsx-calc-label">
                Jump to
              </p>
              <ul className="hero-v2-areas" aria-labelledby="rsx-calc-label">
                <li><Link href="#mortgage">Affordability</Link></li>
                <li><Link href="#emi">EMI</Link></li>
                <li><Link href="#roi">Investment return</Link></li>
              </ul>
            </div>

            <figure className="hero-v2-tower idx-hero-art">
              <Image
                src="/calculators.png"
                alt=""
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 30vw, 70vw"
                className="hero-v2-tower-img"
              />
            </figure>
          </div>
        </section>

        {calculators.map(({ id, eyebrow, title, em, intro, notes, Calculator }, i) => (
          <section
            key={id}
            id={id}
            className={`hlx-section rsx-calc${i % 2 ? " rsx-calc--tint" : ""}`}
          >
            <div className="container rsx-calc-grid">
              <div className="rsx-calc-intro">
                <span className="featured-v2-eyebrow">{eyebrow}</span>
                <h2 className="featured-v2-title">
                  {title} <em>{em}</em>
                </h2>
                <p className="hlx-body">{intro}</p>
                <dl className="rsx-notes">
                  {notes.map(([term, text]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Calculator />
            </div>
          </section>
        ))}

        {/* Closing CTA — landing page's saffron band */}
        <section className="cta-v2">
          <div className="container cta-v2-inner">
            <h2 className="cta-v2-title">
              Know your budget?
              <em>See what it buys.</em>
            </h2>
            <div className="cta-v2-buttons">
              <Link href="/properties" className="cta-v2-btn-primary">
                Browse properties
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/services/home-loans" className="cta-v2-btn-outline">
                Get help with a loan
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
