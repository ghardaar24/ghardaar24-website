"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

interface FilterState {
  area: string;
  property_type: string;
  listing_type: string;
  min_price: string;
  max_price: string;
  bedrooms: string;
  possession: string;
}

const propertyTypes = ["apartment", "house", "villa", "plot", "commercial"];
const bedroomOptions = ["1", "2", "3", "4", "5+"];

const filterFields = [
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
  // Listing Type moved to top-level toggle
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
  {
    name: "possession",
    label: "Possession",
    options: [
      { value: "", label: "Any" },
      { value: "Immediate", label: "Immediate" },
      { value: "2025", label: "2025" },
      { value: "2026", label: "2026" },
      { value: "2027", label: "2027" },
      { value: "2028", label: "2028" },
      { value: "2029", label: "2029" },
    ],
  },
];

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params, update when searchParams change
  const initialFilters = useMemo<FilterState>(
    () => ({
      area: searchParams.get("area") || "",
      property_type: searchParams.get("property_type") || "",
      listing_type: searchParams.get("listing_type") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      possession: searchParams.get("possession") || "",
    }),
    [searchParams]
  );

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Sync filters when URL changes (e.g., browser back/forward)
  const searchParamsKey = searchParams.toString();
  if (
    JSON.stringify(filters) !== JSON.stringify(initialFilters) &&
    searchParamsKey
  ) {
    // Only update if there's a mismatch and we have search params
    const urlFilters = {
      area: searchParams.get("area") || "",
      property_type: searchParams.get("property_type") || "",
      listing_type: searchParams.get("listing_type") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      possession: searchParams.get("possession") || "",
    };
    if (JSON.stringify(filters) !== JSON.stringify(urlFilters)) {
      setFilters(urlFilters);
    }
  }

  const updateFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/properties?${params.toString()}`);
  };

  const setListingType = (type: string) => {
    const newFilters = { ...filters, listing_type: type };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const applyFilters = () => {
    updateFilters(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const newFilters = {
      area: "",
      property_type: "",
      listing_type: "", // Also clear listing type? Or keep it? Usually clear all resets all.
      min_price: "",
      max_price: "",
      bedrooms: "",
      possession: "",
    };
    setFilters(newFilters);
    router.push("/properties");
    setShowFilters(false);
  };

  const removeFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters, [key]: "" };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== "listing_type" && v !== ""
  ).length; // Count filters excluding listing type which is now a tab

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <motion.div
      className="filters-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="filter-bar">
        <div className="filter-left-section">
          <div className="filter-type-toggles">
            <button
              className={`filter-toggle-option ${
                filters.listing_type === "" ? "active" : ""
              }`}
              onClick={() => setListingType("")}
            >
              All
            </button>
            <button
              className={`filter-toggle-option ${
                filters.listing_type === "sale" ? "active" : ""
              }`}
              onClick={() => setListingType("sale")}
            >
              For Sale
            </button>
            <button
              className={`filter-toggle-option ${
                filters.listing_type === "rent" ? "active" : ""
              }`}
              onClick={() => setListingType("rent")}
            >
              For Rent
            </button>
            <button
              className={`filter-toggle-option ${
                filters.listing_type === "resale" ? "active" : ""
              }`}
              onClick={() => setListingType("resale")}
            >
              Resale
            </button>
          </div>

          <div className="active-tags">
            {filters.property_type && (
              <span className="filter-tag">
                {filters.property_type}{" "}
                <X onClick={() => removeFilter("property_type")} />
              </span>
            )}
          </div>
        </div>

        <div className="filter-right-section">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          )}
          <button
            className="filter-btn-main"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="filters-grid">
              {filterFields.map((field) => (
                <div key={field.name} className="filter-group">
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
                </div>
              ))}
            </div>

            <div className="filters-actions">
              <button
                className="btn-secondary-new"
                onClick={() => setShowFilters(false)}
              >
                Cancel
              </button>
              <button className="btn-primary-new" onClick={applyFilters}>
                <Search className="w-4 h-4" />
                Show Properties
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
