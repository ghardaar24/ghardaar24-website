"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

interface FilterState {
  city: string;
  property_type: string;
  listing_type: string;
  min_price: string;
  max_price: string;
  bedrooms: string;
}

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];
const propertyTypes = ["apartment", "house", "villa", "plot", "commercial"];
const bedroomOptions = ["1", "2", "3", "4", "5+"];

const filterFields = [
  {
    name: "city",
    label: "City",
    options: [
      { value: "", label: "All Cities" },
      ...cities.map((c) => ({ value: c, label: c })),
    ],
  },
  {
    name: "property_type",
    label: "Property Type",
    options: [
      { value: "", label: "All Types" },
      ...propertyTypes.map((t) => ({
        value: t,
        label: t.charAt(0).toUpperCase() + t.slice(1),
      })),
    ],
  },
  {
    name: "listing_type",
    label: "Listing Type",
    options: [
      { value: "", label: "Buy or Rent" },
      { value: "sale", label: "For Sale" },
      { value: "rent", label: "For Rent" },
    ],
  },
  {
    name: "bedrooms",
    label: "Bedrooms",
    options: [
      { value: "", label: "Any" },
      ...bedroomOptions.map((b) => ({
        value: b,
        label: `${b} ${b === "5+" ? "" : "BHK"}`,
      })),
    ],
  },
  {
    name: "min_price",
    label: "Min Price",
    options: [
      { value: "", label: "No Min" },
      { value: "500000", label: "₹5 Lakh" },
      { value: "1000000", label: "₹10 Lakh" },
      { value: "2500000", label: "₹25 Lakh" },
      { value: "5000000", label: "₹50 Lakh" },
      { value: "10000000", label: "₹1 Crore" },
      { value: "25000000", label: "₹2.5 Crore" },
    ],
  },
  {
    name: "max_price",
    label: "Max Price",
    options: [
      { value: "", label: "No Max" },
      { value: "1000000", label: "₹10 Lakh" },
      { value: "2500000", label: "₹25 Lakh" },
      { value: "5000000", label: "₹50 Lakh" },
      { value: "10000000", label: "₹1 Crore" },
      { value: "25000000", label: "₹2.5 Crore" },
      { value: "50000000", label: "₹5 Crore" },
      { value: "100000000", label: "₹10 Crore" },
    ],
  },
];

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    city: "",
    property_type: "",
    listing_type: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
  });

  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      property_type: searchParams.get("property_type") || "",
      listing_type: searchParams.get("listing_type") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      bedrooms: searchParams.get("bedrooms") || "",
    });
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/properties?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      property_type: "",
      listing_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
    });
    router.push("/properties");
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const activeFilterCount = Object.values(filters).filter((v) => v).length;

  return (
    <motion.div
      className="filters-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="filters-header">
        <motion.button
          className="filters-toggle"
          onClick={() => setShowFilters(!showFilters)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.span
                className="filter-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {activeFilterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              className="clear-filters"
              onClick={clearFilters}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
              Clear All
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-panel open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="filters-grid">
              {filterFields.map((field, index) => (
                <motion.div
                  key={field.name}
                  className="filter-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <label className="filter-label">{field.label}</label>
                  <select
                    className="filter-select"
                    value={filters[field.name as keyof FilterState]}
                    onChange={(e) =>
                      setFilters({ ...filters, [field.name]: e.target.value })
                    }
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="filters-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                className="btn-secondary-new"
                onClick={clearFilters}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear
              </motion.button>
              <motion.button
                className="btn-primary-new"
                onClick={applyFilters}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
