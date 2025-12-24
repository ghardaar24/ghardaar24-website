"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Calculator,
  IndianRupee,
  Percent,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function EMICalculator() {
  const [activeTab, setActiveTab] = useState<"emi" | "roi">("emi");

  // EMI State
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // ROI State
  const [investmentAmount, setInvestmentAmount] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [appreciationRate, setAppreciationRate] = useState(5);
  const [holdingPeriod, setHoldingPeriod] = useState(5);

  const { emi, totalPayment, totalInterest } = useMemo(() => {
    // EMI calculation formula
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = tenure * 12;

    if (monthlyRate === 0) {
      const calculatedEmi = loanAmount / numberOfMonths;
      return {
        emi: Math.round(calculatedEmi),
        totalPayment: loanAmount,
        totalInterest: 0,
      };
    } else {
      const calculatedEmi =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
        (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

      const totalPayable = calculatedEmi * numberOfMonths;
      const interestPayable = totalPayable - loanAmount;

      return {
        emi: Math.round(calculatedEmi),
        totalPayment: Math.round(totalPayable),
        totalInterest: Math.round(interestPayable),
      };
    }
  }, [loanAmount, interestRate, tenure]);

  const { totalRent, finalValue, totalReturn, roi } = useMemo(() => {
    const totalRentEarned = monthlyRent * 12 * holdingPeriod;
    const finalPropertyValue =
      investmentAmount * Math.pow(1 + appreciationRate / 100, holdingPeriod);
    const totalReturnVal =
      totalRentEarned + finalPropertyValue - investmentAmount;
    const roiVal = (totalReturnVal / investmentAmount) * 100;

    return {
      totalRent: Math.round(totalRentEarned),
      finalValue: Math.round(finalPropertyValue),
      totalReturn: Math.round(totalReturnVal),
      roi: roiVal.toFixed(1),
    };
  }, [investmentAmount, monthlyRent, appreciationRate, holdingPeriod]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
  };

  return (
    <section className="emi-calculator-section">
      <div className="container">
        <motion.div
          className="section-header section-header-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">
            <Calculator className="w-4 h-4" />
            Plan Your Investment
          </span>
          <h2 className="section-title-new">Financial Calculators</h2>
          <p className="section-subtitle">
            Calculate your EMIs or estimate your Return on Investment
          </p>
        </motion.div>

        <div className="calculator-tabs flex justify-center mb-8 gap-4">
          <button
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "emi"
                ? "bg-[#B68D40] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("emi")}
          >
            EMI Calculator
          </button>
          <button
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "roi"
                ? "bg-[#B68D40] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("roi")}
          >
            ROI Calculator
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "emi" ? (
            <motion.div
              key="emi"
              className="emi-calculator-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="emi-calculator-inputs">
                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <IndianRupee className="w-4 h-4" />
                      Loan Amount
                    </label>
                    <span className="emi-input-value">
                      {formatCurrency(loanAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="50000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>₹5L</span>
                    <span>₹5Cr</span>
                  </div>
                </div>

                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <Percent className="w-4 h-4" />
                      Interest Rate
                    </label>
                    <span className="emi-input-value">
                      {interestRate}% p.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>5%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <Calendar className="w-4 h-4" />
                      Loan Tenure
                    </label>
                    <span className="emi-input-value">{tenure} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>1 Yr</span>
                    <span>30 Yrs</span>
                  </div>
                </div>
              </div>

              <div className="emi-calculator-result">
                <div className="emi-result-main">
                  <span className="emi-result-label">Your Monthly EMI</span>
                  <motion.span
                    className="emi-result-value"
                    key={emi}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ₹{emi.toLocaleString("en-IN")}
                  </motion.span>
                </div>

                <div className="emi-result-breakdown">
                  <div className="emi-breakdown-item">
                    <span className="breakdown-label">Principal Amount</span>
                    <span className="breakdown-value principal">
                      {formatCurrency(loanAmount)}
                    </span>
                  </div>
                  <div className="emi-breakdown-item">
                    <span className="breakdown-label">Total Interest</span>
                    <span className="breakdown-value interest">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>
                  <div className="emi-breakdown-item total">
                    <span className="breakdown-label">Total Payment</span>
                    <span className="breakdown-value">
                      {formatCurrency(totalPayment)}
                    </span>
                  </div>
                </div>

                <motion.a
                  href="tel:+919876543210"
                  className="emi-cta"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Best Loan Rates
                </motion.a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="roi"
              className="emi-calculator-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="emi-calculator-inputs">
                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <IndianRupee className="w-4 h-4" />
                      Investment Amount
                    </label>
                    <span className="emi-input-value">
                      {formatCurrency(investmentAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="50000000"
                    step="100000"
                    value={investmentAmount}
                    onChange={(e) =>
                      setInvestmentAmount(Number(e.target.value))
                    }
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>₹5L</span>
                    <span>₹5Cr</span>
                  </div>
                </div>

                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <IndianRupee className="w-4 h-4" />
                      Monthly Rent
                    </label>
                    <span className="emi-input-value">
                      {formatCurrency(monthlyRent)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="1000"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>₹5k</span>
                    <span>₹5L</span>
                  </div>
                </div>

                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <TrendingUp className="w-4 h-4" />
                      Annual Appreciation
                    </label>
                    <span className="emi-input-value">{appreciationRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={appreciationRate}
                    onChange={(e) =>
                      setAppreciationRate(Number(e.target.value))
                    }
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>1%</span>
                    <span>20%</span>
                  </div>
                </div>

                <div className="emi-input-group">
                  <div className="emi-input-header">
                    <label>
                      <Calendar className="w-4 h-4" />
                      Holding Period
                    </label>
                    <span className="emi-input-value">
                      {holdingPeriod} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={holdingPeriod}
                    onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                    className="emi-slider"
                  />
                  <div className="emi-slider-labels">
                    <span>1 Yr</span>
                    <span>20 Yrs</span>
                  </div>
                </div>
              </div>

              <div className="emi-calculator-result">
                <div className="emi-result-main">
                  <span className="emi-result-label">Estimated ROI</span>
                  <motion.span
                    className="emi-result-value"
                    key={roi}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {roi}%
                  </motion.span>
                </div>

                <div className="emi-result-breakdown">
                  <div className="emi-breakdown-item">
                    <span className="breakdown-label">Final Value</span>
                    <span className="breakdown-value principal">
                      {formatCurrency(finalValue)}
                    </span>
                  </div>
                  <div className="emi-breakdown-item">
                    <span className="breakdown-label">Total Rent Earned</span>
                    <span className="breakdown-value interest">
                      {formatCurrency(totalRent)}
                    </span>
                  </div>
                  <div className="emi-breakdown-item total">
                    <span className="breakdown-label">Total Gain</span>
                    <span className="breakdown-value">
                      {formatCurrency(totalReturn)}
                    </span>
                  </div>
                </div>

                <motion.a
                  href="/properties?listing_type=sale"
                  className="emi-cta"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Investment Options
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
