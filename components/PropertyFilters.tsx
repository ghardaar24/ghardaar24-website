"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useRef } from "react";
import { Search, SlidersHorizontal, X, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface FilterState {
  state: string;
  city: string;
  property_type: string;
  listing_type: string;
  min_price: string;
  max_price: string;
  bedrooms: string;
  possession: string;
  search: string;
}

const propertyTypes = ["apartment", "house", "villa", "plot", "commercial"];
const bedroomOptions = ["1", "2", "3", "4", "5+"];

// Price presets with Indian notation (K = Thousand, L = Lakh, Cr = Crore)
const pricePresets = [
  { value: "10000", label: "10K", fullLabel: "₹10,000" },
  { value: "50000", label: "50K", fullLabel: "₹50,000" },
  { value: "100000", label: "1L", fullLabel: "₹1 Lakh" },
  { value: "500000", label: "5L", fullLabel: "₹5 Lakh" },
  { value: "1000000", label: "10L", fullLabel: "₹10 Lakh" },
  { value: "2500000", label: "25L", fullLabel: "₹25 Lakh" },
  { value: "5000000", label: "50L", fullLabel: "₹50 Lakh" },
  { value: "7500000", label: "75L", fullLabel: "₹75 Lakh" },
  { value: "10000000", label: "1Cr", fullLabel: "₹1 Crore" },
  { value: "15000000", label: "1.5Cr", fullLabel: "₹1.5 Crore" },
  { value: "20000000", label: "2Cr", fullLabel: "₹2 Crore" },
  { value: "30000000", label: "3Cr", fullLabel: "₹3 Crore" },
  { value: "50000000", label: "5Cr", fullLabel: "₹5 Crore" },
  { value: "100000000", label: "10Cr", fullLabel: "₹10 Crore" },
];

// Format price to Indian notation
const formatPriceIndian = (value: string): string => {
  if (!value) return "";
  const num = parseInt(value);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(0)}K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

// Parse Indian notation to number
const parseIndianNotation = (input: string): string => {
  const cleaned = input.replace(/[₹,\s]/g, "").toUpperCase();

  // Match patterns like 10K, 50L, 1CR, 1.5CR, etc.
  const croreMatch = cleaned.match(/^(\d+\.?\d*)\s*CR$/);
  if (croreMatch) {
    return String(Math.round(parseFloat(croreMatch[1]) * 10000000));
  }

  const lakhMatch = cleaned.match(/^(\d+\.?\d*)\s*L$/);
  if (lakhMatch) {
    return String(Math.round(parseFloat(lakhMatch[1]) * 100000));
  }

  const thousandMatch = cleaned.match(/^(\d+\.?\d*)\s*K$/);
  if (thousandMatch) {
    return String(Math.round(parseFloat(thousandMatch[1]) * 1000));
  }

  // If just a number, return it
  const numMatch = cleaned.match(/^(\d+)$/);
  if (numMatch) {
    return numMatch[1];
  }

  return "";
};

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
  const [locations, setLocations] = useState<{ state: string; city: string }[]>(
    []
  );
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");

  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from("locations")
        .select("state, city")
        .eq("is_active", true);
      if (data) setLocations(data);
    }
    fetchLocations();
  }, []);

  const uniqueStates = Array.from(
    new Set(locations.map((l) => l.state))
  ).sort();
  const availableCities = useMemo(() => {
    const currentState = searchParams.get("state");
    if (!currentState) return [];
    return locations
      .filter((l) => l.state === currentState)
      .map((l) => l.city)
      .sort();
  }, [locations, searchParams]);

  // Initialize filters from URL params, update when searchParams change
  const initialFilters = useMemo<FilterState>(
    () => ({
      state: searchParams.get("state") || "",
      city: searchParams.get("city") || "",
      property_type: searchParams.get("property_type") || "",
      listing_type: searchParams.get("listing_type") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      possession: searchParams.get("possession") || "",
      search: searchParams.get("search") || "",
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
      state: searchParams.get("state") || "",
      city: searchParams.get("city") || "",
      property_type: searchParams.get("property_type") || "",
      listing_type: searchParams.get("listing_type") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      possession: searchParams.get("possession") || "",
      search: searchParams.get("search") || "",
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
      state: "",
      city: "",
      property_type: "",
      listing_type: "", // Also clear listing type? Or keep it? Usually clear all resets all.
      min_price: "",
      max_price: "",
      bedrooms: "",
      possession: "",
      search: "",
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
      {/* Search Bar */}
      <div className="property-search-bar">
        <div className="property-search-input-wrapper">
          <Search className="property-search-icon" />
          <input
            type="text"
            className="property-search-input"
            placeholder="Search by property name, area, or city..."
            value={filters.search}
            onChange={(e) => {
              const newFilters = { ...filters, search: e.target.value };
              setFilters(newFilters);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters(filters);
              }
            }}
          />
          {filters.search && (
            <button
              className="property-search-clear"
              onClick={() => {
                const newFilters = { ...filters, search: "" };
                setFilters(newFilters);
                updateFilters(newFilters);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          className="property-search-btn"
          onClick={() => updateFilters(filters)}
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

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
              {/* Location Filters */}
              <div className="filter-group">
                <label className="filter-label">State</label>
                <select
                  className="filter-select"
                  value={filters.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    const newCity =
                      newState === filters.state ? filters.city : ""; // Reset city if state changes
                    setFilters({ ...filters, state: newState, city: newCity });
                  }}
                >
                  <option value="">All States</option>
                  {uniqueStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">City</label>
                <select
                  className="filter-select"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters({ ...filters, city: e.target.value })
                  }
                  disabled={!filters.state}
                >
                  <option value="">All Cities</option>
                  {locations
                    .filter((l) => l.state === filters.state)
                    .map((l) => l.city)
                    .sort()
                    .map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

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

            {/* Enhanced Price Selector */}
            <div className="price-filter-section">
              <div className="price-filter-header">
                <IndianRupee className="w-4 h-4" />
                <span>Price Range</span>
                {(filters.min_price || filters.max_price) && (
                  <span className="price-range-display">
                    {filters.min_price
                      ? formatPriceIndian(filters.min_price)
                      : "No Min"}
                    {" - "}
                    {filters.max_price
                      ? formatPriceIndian(filters.max_price)
                      : "No Max"}
                  </span>
                )}
              </div>

              {/* Quick Select Buttons */}
              <div className="price-quick-select">
                <div className="price-quick-label">Quick Select:</div>
                <div className="price-quick-buttons">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.value}
                      className={`price-preset-btn ${
                        filters.min_price === preset.value ||
                        filters.max_price === preset.value
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        // If clicking on a selected min_price, clear it
                        if (filters.min_price === preset.value) {
                          setFilters({ ...filters, min_price: "" });
                        }
                        // If clicking on a selected max_price, clear it
                        else if (filters.max_price === preset.value) {
                          setFilters({ ...filters, max_price: "" });
                        }
                        // If no min_price set, set it
                        else if (!filters.min_price) {
                          setFilters({ ...filters, min_price: preset.value });
                          setCustomMinPrice(preset.label);
                        }
                        // If min_price set but no max_price, set max if greater than min
                        else if (!filters.max_price) {
                          if (
                            parseInt(preset.value) >=
                            parseInt(filters.min_price)
                          ) {
                            setFilters({ ...filters, max_price: preset.value });
                            setCustomMaxPrice(preset.label);
                          } else {
                            // If less than min, make it the new min
                            setFilters({
                              ...filters,
                              min_price: preset.value,
                              max_price: filters.min_price,
                            });
                            setCustomMinPrice(preset.label);
                          }
                        }
                        // Both set, replace the min_price
                        else {
                          setFilters({ ...filters, min_price: preset.value });
                          setCustomMinPrice(preset.label);
                        }
                      }}
                      title={preset.fullLabel}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Price Inputs */}
              <div className="price-range-inputs">
                <div className="price-input-group">
                  <label className="filter-label">Min Price</label>
                  <div className="price-input-wrapper">
                    <span className="price-input-prefix">₹</span>
                    <input
                      type="text"
                      className="price-input"
                      placeholder="e.g., 10L or 50000"
                      value={
                        customMinPrice ||
                        (filters.min_price
                          ? formatPriceIndian(filters.min_price).replace(
                              "₹",
                              ""
                            )
                          : "")
                      }
                      onChange={(e) => {
                        setCustomMinPrice(e.target.value);
                      }}
                      onBlur={(e) => {
                        const parsed = parseIndianNotation(e.target.value);
                        if (parsed) {
                          setFilters({ ...filters, min_price: parsed });
                          setCustomMinPrice("");
                        } else if (!e.target.value) {
                          setFilters({ ...filters, min_price: "" });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const parsed = parseIndianNotation(customMinPrice);
                          if (parsed) {
                            setFilters({ ...filters, min_price: parsed });
                            setCustomMinPrice("");
                          }
                        }
                      }}
                    />
                    {filters.min_price && (
                      <button
                        className="price-clear-btn"
                        onClick={() => {
                          setFilters({ ...filters, min_price: "" });
                          setCustomMinPrice("");
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="price-input-hint">
                    Use K, L, Cr (e.g., 50L, 1Cr)
                  </span>
                </div>

                <div className="price-input-separator">to</div>

                <div className="price-input-group">
                  <label className="filter-label">Max Price</label>
                  <div className="price-input-wrapper">
                    <span className="price-input-prefix">₹</span>
                    <input
                      type="text"
                      className="price-input"
                      placeholder="e.g., 2Cr or 5000000"
                      value={
                        customMaxPrice ||
                        (filters.max_price
                          ? formatPriceIndian(filters.max_price).replace(
                              "₹",
                              ""
                            )
                          : "")
                      }
                      onChange={(e) => {
                        setCustomMaxPrice(e.target.value);
                      }}
                      onBlur={(e) => {
                        const parsed = parseIndianNotation(e.target.value);
                        if (parsed) {
                          setFilters({ ...filters, max_price: parsed });
                          setCustomMaxPrice("");
                        } else if (!e.target.value) {
                          setFilters({ ...filters, max_price: "" });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const parsed = parseIndianNotation(customMaxPrice);
                          if (parsed) {
                            setFilters({ ...filters, max_price: parsed });
                            setCustomMaxPrice("");
                          }
                        }
                      }}
                    />
                    {filters.max_price && (
                      <button
                        className="price-clear-btn"
                        onClick={() => {
                          setFilters({ ...filters, max_price: "" });
                          setCustomMaxPrice("");
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="price-input-hint">
                    Use K, L, Cr (e.g., 50L, 1Cr)
                  </span>
                </div>
              </div>

              {/* Clear Price Filters */}
              {(filters.min_price || filters.max_price) && (
                <button
                  className="clear-price-btn"
                  onClick={() => {
                    setFilters({ ...filters, min_price: "", max_price: "" });
                    setCustomMinPrice("");
                    setCustomMaxPrice("");
                  }}
                >
                  <X className="w-3 h-3" />
                  Clear Price Filters
                </button>
              )}
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
