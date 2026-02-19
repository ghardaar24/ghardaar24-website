
"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "@/lib/motion";

interface AdminCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function AdminCheckbox({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = "",
}: AdminCheckboxProps) {
  return (
    <div
      className={`admin-checkbox-container flex items-center gap-3 cursor-pointer ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only" // Hide default checkbox
        />
        <motion.div
          className={`w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center transition-colors ${
            checked ? "bg-[var(--primary)] border-[var(--primary)]" : "hover:border-[var(--primary)]"
          }`}
          initial={false}
          animate={{
            scale: checked ? 1 : 1,
            backgroundColor: checked ? "var(--primary)" : "#ffffff",
            borderColor: checked ? "var(--primary)" : "#d1d5db",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {checked && (
            <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
          )}
        </motion.div>
      </div>
      <span className="text-sm font-medium text-gray-700 select-none">
        {label}
      </span>
    </div>
  );
}
