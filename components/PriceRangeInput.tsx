"use client";

import { useState, useEffect } from "react";
import { IndianRupee, X } from "lucide-react";
import {
  pricePresets,
  formatPriceIndian,
  parseIndianNotation,
} from "@/lib/utils";

interface PriceRangeInputProps {
  minPrice: string;
  maxPrice: string;
  onChange: (values: { min: string; max: string }) => void;
  error?: string;
}

export default function PriceRangeInput({
  minPrice,
  maxPrice,
  onChange,
  error,
}: PriceRangeInputProps) {
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  // Sync inputs when external values change
  useEffect(() => {
    if (minPrice) {
      // Only update if the parsed value of current input doesn't match the prop
      // This prevents overwriting while typing if round-tripping isn't perfect
      // But since we only have onBlur update, we can safely overwrite on prop change
      // assuming prop change only comes from our onBlur or external source
      // eslint-disable-next-line
      setMinInput(formatPriceIndian(minPrice).replace("₹", "").trim());
    } else {
      setMinInput("");
    }
  }, [minPrice]);

  useEffect(() => {
    if (maxPrice) {
      // eslint-disable-next-line
      setMaxInput(formatPriceIndian(maxPrice).replace("₹", "").trim());
    } else {
      setMaxInput("");
    }
  }, [maxPrice]);

  const handleMinChange = (val: string) => {
    setMinInput(val);
  };

  const handleMaxChange = (val: string) => {
    setMaxInput(val);
  };

  const handleMinBlur = () => {
    const parsed = parseIndianNotation(minInput);
    if (parsed) {
      onChange({ min: parsed, max: maxPrice });
      // We rely on the useEffect to format the input back after prop update
    } else if (!minInput) {
      onChange({ min: "", max: maxPrice });
    }
  };

  const handleMaxBlur = () => {
    const parsed = parseIndianNotation(maxInput);
    if (parsed) {
      onChange({ min: minPrice, max: parsed });
      // We rely on the useEffect to format the input back after prop update
    } else if (!maxInput) {
      onChange({ min: minPrice, max: "" });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Blur the input to trigger validation and formatting
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          Price Range (₹) *
        </label>
        {(minPrice || maxPrice) && (
          <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-lg">
            <IndianRupee className="w-5 h-5" />
            <span>
              {formatPriceIndian(minPrice)} - {formatPriceIndian(maxPrice)}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange({ min: "", max: "" });
                // Inputs will be cleared by useEffect
              }}
              className="ml-2 p-1 rounded-full bg-[var(--gray-100)] hover:bg-red-100 text-[var(--gray-500)] hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Min Price Section */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Min Price
          </label>
          <div className="flex flex-wrap gap-2">
            {pricePresets.map((preset) => (
              <button
                key={`min-${preset.value}`}
                type="button"
                className={`price-preset-btn ${
                  minPrice === preset.value ? "active" : ""
                }`}
                onClick={() => {
                  onChange({ min: preset.value, max: maxPrice });
                  // Input will be updated by useEffect
                }}
                title={preset.fullLabel}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="price-input-wrapper">
            <span className="price-input-prefix">₹</span>
            <input
              type="text"
              className="price-input"
              placeholder="Min Price (e.g. 80L)"
              value={minInput}
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleMinBlur}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Max Price Section */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Max Price
          </label>
          <div className="flex flex-wrap gap-2">
            {pricePresets.map((preset) => (
              <button
                key={`max-${preset.value}`}
                type="button"
                className={`price-preset-btn ${
                  maxPrice === preset.value ? "active" : ""
                }`}
                onClick={() => {
                  onChange({ min: minPrice, max: preset.value });
                  // Input will be updated by useEffect
                }}
                title={preset.fullLabel}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="price-input-wrapper">
            <span className="price-input-prefix">₹</span>
            <input
              type="text"
              className="price-input"
              placeholder="Max Price (e.g. 1Cr)"
              value={maxInput}
              onChange={(e) => handleMaxChange(e.target.value)}
              onBlur={handleMaxBlur}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
