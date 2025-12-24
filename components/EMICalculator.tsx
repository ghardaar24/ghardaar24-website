"use client";

import { useState, useEffect } from "react";
import { motion } from "@/lib/motion";
import { Calculator, IndianRupee, Percent, Calendar } from "lucide-react";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    // EMI calculation formula
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = tenure * 12;

    if (monthlyRate === 0) {
      const calculatedEmi = loanAmount / numberOfMonths;
      setEmi(Math.round(calculatedEmi));
      setTotalPayment(loanAmount);
      setTotalInterest(0);
    } else {
      const calculatedEmi =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
        (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

      const totalPayable = calculatedEmi * numberOfMonths;
      const interestPayable = totalPayable - loanAmount;

      setEmi(Math.round(calculatedEmi));
      setTotalPayment(Math.round(totalPayable));
      setTotalInterest(Math.round(interestPayable));
    }
  }, [loanAmount, interestRate, tenure]);

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
          <h2 className="section-title-new">EMI Calculator</h2>
          <p className="section-subtitle">
            Calculate your monthly home loan EMI instantly
          </p>
        </motion.div>

        <motion.div
          className="emi-calculator-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
                <span className="emi-input-value">{interestRate}% p.a.</span>
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
      </div>
    </section>
  );
}
