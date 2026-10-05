"use client";

import { useState, useMemo } from "react";
import { motion } from "@/lib/motion";
import { IndianRupee, TrendingUp, Calendar } from "lucide-react";

export default function ROICalculator() {
  const [investmentAmount, setInvestmentAmount] = useState(5000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [appreciationRate, setAppreciationRate] = useState(5);
  const [holdingPeriod, setHoldingPeriod] = useState(5);

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
              <IndianRupee className="w-4 h-4" />
              Property price
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
            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
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
              Monthly rent
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
              Yearly price growth
            </label>
            <span className="emi-input-value">{appreciationRate}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={appreciationRate}
            onChange={(e) => setAppreciationRate(Number(e.target.value))}
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
              Years you hold it
            </label>
            <span className="emi-input-value">{holdingPeriod} years</span>
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
          <span className="emi-result-label">Estimated total return</span>
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
            <span className="breakdown-label">Value at sale</span>
            <span className="breakdown-value principal">
              {formatCurrency(finalValue)}
            </span>
          </div>
          <div className="emi-breakdown-item">
            <span className="breakdown-label">Rent earned</span>
            <span className="breakdown-value interest">
              {formatCurrency(totalRent)}
            </span>
          </div>
          <div className="emi-breakdown-item total">
            <span className="breakdown-label">Total gain</span>
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
          Explore properties for sale
        </motion.a>
      </div>
    </motion.div>
  );
}
