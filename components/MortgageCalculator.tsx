"use client";

import { useState, useMemo } from "react";
import { motion } from "@/lib/motion";
import {
  Home,
  IndianRupee,
  Percent,
  Calendar,
  Wallet,
  PiggyBank,
} from "lucide-react";

export default function MortgageCalculator() {
  const [annualIncome, setAnnualIncome] = useState(1200000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { maxLoan, maxPropertyValue, suggestedEMI, dti } = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const disposableIncome = monthlyIncome - monthlyExpenses;
    
    // Banks typically allow EMI to be 40-50% of net monthly income
    const maxEMI = disposableIncome * 0.45;
    
    // Calculate max loan from EMI using reverse EMI formula
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = tenure * 12;
    
    let maxLoanAmount: number;
    if (monthlyRate === 0) {
      maxLoanAmount = maxEMI * numberOfMonths;
    } else {
      maxLoanAmount = (maxEMI * (Math.pow(1 + monthlyRate, numberOfMonths) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));
    }
    
    const maxPropertyVal = maxLoanAmount + downPayment;
    const dtiRatio = ((maxEMI / monthlyIncome) * 100);

    return {
      maxLoan: Math.round(maxLoanAmount),
      maxPropertyValue: Math.round(maxPropertyVal),
      suggestedEMI: Math.round(maxEMI),
      dti: dtiRatio.toFixed(1),
    };
  }, [annualIncome, monthlyExpenses, downPayment, interestRate, tenure]);

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
    <motion.div
      className="emi-calculator-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="emi-calculator-inputs">
        <div className="emi-input-group">
          <div className="emi-input-header">
            <label>
              <Wallet className="w-4 h-4" />
              Annual income
            </label>
            <span className="emi-input-value">
              {formatCurrency(annualIncome)}
            </span>
          </div>
          <input
            type="range"
            min="300000"
            max="10000000"
            step="100000"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="emi-slider"
          />
          <div className="emi-slider-labels">
            <span>₹3L</span>
            <span>₹1Cr</span>
          </div>
        </div>

        <div className="emi-input-group">
          <div className="emi-input-header">
            <label>
              <IndianRupee className="w-4 h-4" />
              Monthly expenses
            </label>
            <span className="emi-input-value">
              {formatCurrency(monthlyExpenses)}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            className="emi-slider"
          />
          <div className="emi-slider-labels">
            <span>₹10k</span>
            <span>₹5L</span>
          </div>
        </div>

        <div className="emi-input-group">
          <div className="emi-input-header">
            <label>
              <PiggyBank className="w-4 h-4" />
              Down payment
            </label>
            <span className="emi-input-value">
              {formatCurrency(downPayment)}
            </span>
          </div>
          <input
            type="range"
            min="100000"
            max="20000000"
            step="100000"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="emi-slider"
          />
          <div className="emi-slider-labels">
            <span>₹1L</span>
            <span>₹2Cr</span>
          </div>
        </div>

        <div className="emi-input-group">
          <div className="emi-input-header">
            <label>
              <Percent className="w-4 h-4" />
              Interest rate
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
              Loan tenure
            </label>
            <span className="emi-input-value">{tenure} years</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="emi-slider"
          />
          <div className="emi-slider-labels">
            <span>5 Yrs</span>
            <span>30 Yrs</span>
          </div>
        </div>
      </div>

      <div className="emi-calculator-result">
        <div className="emi-result-main">
          <span className="emi-result-label">You can afford up to</span>
          <motion.span
            className="emi-result-value"
            key={maxPropertyValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatCurrency(maxPropertyValue)}
          </motion.span>
        </div>

        <div className="emi-result-breakdown">
          <div className="emi-breakdown-item">
            <span className="breakdown-label">Maximum Loan amount</span>
            <span className="breakdown-value principal">
              {formatCurrency(maxLoan)}
            </span>
          </div>
          <div className="emi-breakdown-item">
            <span className="breakdown-label">Suggested EMI</span>
            <span className="breakdown-value interest">
              {formatCurrency(suggestedEMI)}/mo
            </span>
          </div>
          <div className="emi-breakdown-item">
            <span className="breakdown-label">Debt-to-income ratio</span>
            <span className="breakdown-value">
              {dti}%
            </span>
          </div>
          <div className="emi-breakdown-item total">
            <span className="breakdown-label">Down payment</span>
            <span className="breakdown-value">
              {formatCurrency(downPayment)}
            </span>
          </div>
        </div>

        <motion.a
          href="/properties?listing_type=sale"
          className="emi-cta"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home className="w-4 h-4" />
          See homes in your budget
        </motion.a>
      </div>
    </motion.div>
  );
}
