import { Metadata } from "next";
import Link from "next/link";
import {
  Calculator,
  IndianRupee,
  TrendingUp,
  Home,
  ArrowRight,
  HelpCircle,
  Percent,
  PiggyBank,
  Wallet,
} from "lucide-react";
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
};

const calculatorInfo = [
  {
    id: "emi",
    title: "EMI Calculator",
    description:
      "Calculate your Equated Monthly Installment for home loans. Understand how much you&apos;ll pay each month based on loan amount, interest rate, and tenure.",
    icon: IndianRupee,
    color: "#16a34a",
    features: [
      "Instant EMI calculation",
      "Interest vs Principal breakdown",
      "Adjustable loan parameters",
      "Total payment summary",
    ],
  },
  {
    id: "roi",
    title: "ROI Calculator",
    description:
      "Estimate your Return on Investment for property purchases. Factor in rental income and property appreciation to see your potential gains.",
    icon: TrendingUp,
    color: "#2563eb",
    features: [
      "Rental yield calculation",
      "Property appreciation forecast",
      "Total return estimation",
      "Investment period analysis",
    ],
  },
  {
    id: "mortgage",
    title: "Mortgage Affordability",
    description:
      "Find out how much property you can afford based on your income and expenses. Banks typically limit EMI to 45% of your disposable income.",
    icon: Home,
    color: "#f36a2a",
    features: [
      "Income-based calculation",
      "Expense consideration",
      "Down payment planning",
      "Debt-to-income ratio",
    ],
  },
];

export default function CalculatorsPage() {
  return (
    <>
      <Header />
      <main className="calculators-page">
        {/* Hero Section */}
        <section className="calculators-hero">
          <div className="container">
            <div className="calculators-hero-content">
              <span className="section-label">
                <Calculator className="w-4 h-4" />
                Financial Tools
              </span>
              <h1 className="calculators-hero-title">
                Plan Your Property Investment
              </h1>
              <p className="calculators-hero-subtitle">
                Use our free financial calculators to make informed decisions
                about home loans, property investments, and mortgage
                affordability.
              </p>
            </div>

            {/* Quick Jump Links */}
            <div className="calculators-quick-links">
              {calculatorInfo.map((calc) => (
                <Link
                  key={calc.id}
                  href={`#${calc.id}`}
                  className="calculator-quick-link"
                >
                  <calc.icon
                    className="w-5 h-5"
                    style={{ color: calc.color }}
                  />
                  <span>{calc.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* EMI Calculator Section */}
        <section id="emi" className="calculator-section">
          <div className="container">
            <div className="calculator-section-header">
              <div className="calculator-info-card">
                <div
                  className="calculator-info-icon"
                  style={{ background: "rgba(22, 163, 74, 0.1)" }}
                >
                  <IndianRupee className="w-6 h-6" style={{ color: "#16a34a" }} />
                </div>
                <div className="calculator-info-content">
                  <h2 className="calculator-info-title">EMI Calculator</h2>
                  <p className="calculator-info-desc">
                    EMI (Equated Monthly Installment) is the fixed amount you pay
                    to the lender each month until your loan is fully repaid. It
                    includes both principal and interest components.
                  </p>
                  <div className="calculator-info-features">
                    <div className="info-feature">
                      <HelpCircle className="w-4 h-4" />
                      <span>
                        <strong>How it works:</strong> Enter your loan amount,
                        interest rate, and tenure to see your monthly payment
                        breakdown.
                      </span>
                    </div>
                    <div className="info-feature">
                      <Percent className="w-4 h-4" />
                      <span>
                        <strong>Tip:</strong> Current home loan rates in India
                        range from 8.5% to 10.5% p.a.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <EMICalculator />
          </div>
        </section>

        {/* ROI Calculator Section */}
        <section id="roi" className="calculator-section calculator-section-alt">
          <div className="container">
            <div className="calculator-section-header">
              <div className="calculator-info-card">
                <div
                  className="calculator-info-icon"
                  style={{ background: "rgba(37, 99, 235, 0.1)" }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: "#2563eb" }} />
                </div>
                <div className="calculator-info-content">
                  <h2 className="calculator-info-title">ROI Calculator</h2>
                  <p className="calculator-info-desc">
                    Return on Investment measures your total gain from a property
                    purchase, including rental income and property appreciation
                    over time.
                  </p>
                  <div className="calculator-info-features">
                    <div className="info-feature">
                      <HelpCircle className="w-4 h-4" />
                      <span>
                        <strong>How it works:</strong> Input property value,
                        expected rent, appreciation rate, and holding period to
                        estimate returns.
                      </span>
                    </div>
                    <div className="info-feature">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        <strong>Insight:</strong> Indian real estate typically
                        appreciates 5-8% annually in growing cities.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ROICalculator />
          </div>
        </section>

        {/* Mortgage Affordability Section */}
        <section id="mortgage" className="calculator-section">
          <div className="container">
            <div className="calculator-section-header">
              <div className="calculator-info-card">
                <div
                  className="calculator-info-icon"
                  style={{ background: "rgba(243, 106, 42, 0.1)" }}
                >
                  <Home className="w-6 h-6" style={{ color: "#f36a2a" }} />
                </div>
                <div className="calculator-info-content">
                  <h2 className="calculator-info-title">
                    Mortgage Affordability Calculator
                  </h2>
                  <p className="calculator-info-desc">
                    Determine how much property you can afford based on your
                    income and monthly expenses. This helps you set realistic
                    expectations before house hunting.
                  </p>
                  <div className="calculator-info-features">
                    <div className="info-feature">
                      <Wallet className="w-4 h-4" />
                      <span>
                        <strong>The 45% Rule:</strong> Banks typically approve
                        loans where EMI is at most 45% of your net monthly income.
                      </span>
                    </div>
                    <div className="info-feature">
                      <PiggyBank className="w-4 h-4" />
                      <span>
                        <strong>Down Payment:</strong> Most lenders require 10-20%
                        down payment. Higher down payment means lower EMI.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <MortgageCalculator />
          </div>
        </section>

        {/* CTA Section */}
        <section className="calculators-cta">
          <div className="container">
            <div className="calculators-cta-card">
              <h2>Ready to Find Your Dream Property?</h2>
              <p>
                Now that you know your budget, explore our curated collection of
                properties that match your affordability.
              </p>
              <Link href="/properties" className="calculators-cta-btn">
                Browse Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

