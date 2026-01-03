"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  Upload,
  X,
  Save,
  Plus,
  FileText,
  CheckCircle,
  Home,
  Sparkles,
  Loader2,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import PriceRangeInput from "@/components/PriceRangeInput";
import Image from "next/image";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  defaultAmenitiesWithIcons,
  defaultAmenityNames,
} from "@/lib/amenityIcons";

interface PropertyFormData {
  title: string;
  description: string;
  min_price: string;
  max_price: string;
  state: string;
  city: string;
  area: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  property_type: "apartment" | "house" | "villa" | "plot" | "commercial";
  listing_type: "rent" | "resale";
  // Project Details
  land_parcel: string;
  towers: string;
  floors: string;
  config: string;
  carpet_area: string;
  // RERA & Legal Details
  rera_no: string;
  possession_status: string;
  target_possession: string;
  litigation: boolean;
  // Owner Details
  owner_name: string;
  owner_phone: string;
  owner_email: string;
}

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  min_price: "",
  max_price: "",
  state: "",
  city: "",
  area: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  property_type: "apartment",
  listing_type: "rent",
  // Project Details
  land_parcel: "",
  towers: "",
  floors: "",
  config: "",
  carpet_area: "",
  // RERA & Legal Details
  rera_no: "",
  possession_status: "",
  target_possession: "",
  litigation: false,
  // Owner Details
  owner_name: "",
  owner_phone: "",
  owner_email: "",
};

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
  if (isNaN(num)) return "";
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

export default function SubmitPropertyPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [brochures, setBrochures] = useState<File[]>([]);
  const [brochureNames, setBrochureNames] = useState<string[]>([]);
  const [existingAreas, setExistingAreas] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/properties/submit");
    }
  }, [authLoading, user, router]);

  const [locations, setLocations] = useState<{ state: string; city: string }[]>(
    []
  );
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("state, city")
        .eq("is_active", true);

      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  }

  // Get unique states
  const uniqueStates = Array.from(
    new Set(locations.map((l) => l.state))
  ).sort();

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setFormData((prev) => ({ ...prev, state: newState, city: "" }));

    // Filter cities for selected state
    const cities = locations
      .filter((l) => l.state === newState)
      .map((l) => l.city)
      .sort();
    setAvailableCities(cities);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      setError("Maximum 10 images allowed for user submissions");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities((prev) => [...prev, customAmenity.trim()]);
      setCustomAmenity("");
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const image of images) {
      const fileName = `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}-${image.name}`;
      const { data, error } = await supabase.storage
        .from("property-images")
        .upload(fileName, image);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("property-images")
        .getPublicUrl(data.path);

      urls.push(urlData.publicUrl);
    }

    return urls;
  };

  const uploadBrochures = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const brochure of brochures) {
      const fileName = `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}-${brochure.name}`;
      const { data, error } = await supabase.storage
        .from("property-brochures")
        .upload(fileName, brochure);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("property-brochures")
        .getPublicUrl(data.path);

      urls.push(urlData.publicUrl);
    }

    return urls;
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + brochures.length > 2) {
      setError("Maximum 2 brochures allowed for user submissions");
      return;
    }

    const validFiles: File[] = [];
    const validNames: string[] = [];

    for (const file of files) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed for brochures");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Brochure file size must be less than 10MB");
        return;
      }
      validFiles.push(file);
      validNames.push(file.name);
    }

    setBrochures((prev) => [...prev, ...validFiles]);
    setBrochureNames((prev) => [...prev, ...validNames]);
  };

  const removeBrochure = (index: number) => {
    setBrochures((prev) => prev.filter((_, i) => i !== index));
    setBrochureNames((prev) => prev.filter((_, i) => i !== index));
    if (brochureInputRef.current) {
      brochureInputRef.current.value = "";
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.state || !formData.city) {
      setError(
        "Please fill in Title, State, and City to generate a description."
      );
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          property_type: formData.property_type,
          listing_type: formData.listing_type,
          location: {
            state: formData.state,
            city: formData.city,
            area: formData.area,
            address: formData.address,
          },
          features: {
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            amenities: amenities,
          },
          project_details: {
            config: formData.config,
            floors: formData.floors,
            possession_status: formData.possession_status,
            carpet_area: formData.carpet_area,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description");
      }

      setFormData((prev) => ({ ...prev, description: data.description }));
    } catch (err) {
      console.error("Error generating description:", err);
      setError("Failed to generate description. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      if (!user?.id) {
        throw new Error("You must be logged in to submit a property");
      }

      // Validate required fields
      if (
        !formData.title ||
        !formData.min_price ||
        !formData.max_price ||
        !formData.state ||
        !formData.city ||
        !formData.area ||
        !formData.address ||
        !formData.owner_name ||
        !formData.owner_phone ||
        !formData.owner_email
      ) {
        throw new Error(
          "Please fill in all required fields including owner details"
        );
      }

      // Upload images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      // Upload brochures
      let uploadedBrochureUrls: string[] = [];
      if (brochures.length > 0) {
        uploadedBrochureUrls = await uploadBrochures();
      }

      // Insert property with pending status
      const { error: insertError } = await supabase.from("properties").insert({
        title: formData.title,
        description: formData.description,
        min_price: parseInt(formData.min_price),
        max_price: parseInt(formData.max_price),
        price: parseInt(formData.min_price), // approximate for backward compatibility
        state: formData.state,
        city: formData.city,
        address: formData.address,
        area: formData.area,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        featured: false,
        images: imageUrls,
        amenities: amenities,
        brochure_urls: uploadedBrochureUrls,
        // Project Details
        land_parcel: parseFloat(formData.land_parcel) || 0,
        towers: parseInt(formData.towers) || 0,
        floors: formData.floors,
        config: formData.config,
        carpet_area: formData.carpet_area,
        // RERA & Legal Details
        rera_no: formData.rera_no,
        possession_status: formData.possession_status,
        target_possession: formData.target_possession,
        litigation: formData.litigation,
        // Approval workflow
        approval_status: "pending",
        submitted_by: user.id,
        submission_date: new Date().toISOString(),
        // Owner Details
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_email: formData.owner_email,
      });

      if (insertError) throw insertError;

      // Log property listing to Google Sheets (fire and forget - don't block on this)
      try {
        fetch("/api/log-to-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "property",
            data: {
              title: formData.title,
              property_type: formData.property_type,
              listing_type: formData.listing_type,
              min_price: formData.min_price,
              max_price: formData.max_price,
              location: `${formData.city}, ${formData.state}`,
              owner_name: formData.owner_name,
              owner_phone: formData.owner_phone,
              owner_email: formData.owner_email,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch((logError) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to log property to sheets:", logError);
          }
        });
      } catch (logError) {
        // Silent fail - don't block property submission
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to log property to sheets:", logError);
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error submitting property:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit property"
      );
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Property Submitted!
          </h1>
          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            Thank you for submitting your property. Our team will review it and
            <strong className="text-[var(--foreground)]">
              {" "}
              approve it within 2 business days
            </strong>
            .
          </p>{" "}
          <p className="text-sm text-[var(--text-muted)] mb-8 bg-[var(--surface-soft)] p-3 rounded-[var(--radius)]">
            You will be notified once your property is approved and listed.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[var(--foreground)] text-white rounded-[var(--radius-full)] font-semibold hover:bg-black transition-all"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <Link
              href="/properties"
              className="flex items-center justify-center w-full py-3 px-6 bg-white border border-[var(--border)] text-[var(--foreground)] rounded-[var(--radius-full)] font-semibold hover:bg-[var(--surface-soft)] transition-all"
            >
              Browse Properties
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-28 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Submit Your Property
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">
              List your property for rent or resale on Ghardaar24
            </p>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-[var(--radius)] flex items-center gap-2 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <X className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="bg-blue-50 border border-blue-100 rounded-[var(--radius-lg)] p-4 mb-8 flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-blue-100 p-1 rounded-full shrink-0 mt-0.5">
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-blue-800 text-sm md:text-base">
            <strong className="font-semibold block mb-0.5">
              Submission Process
            </strong>
            Submitted properties will be reviewed by our team and approved
            within 2 business days.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Modern 3BHK Apartment in Andheri West"
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  <div className="flex justify-between items-center w-full">
                    <span>Description</span>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generating}
                      className="text-xs flex items-center gap-1.5 text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium transition-colors"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Auto-Generate
                        </>
                      )}
                    </button>
                  </div>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your property..."
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)] resize-y min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="property_type"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Property Type *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white text-[var(--foreground)]"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="listing_type"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Listing Type *
                </label>
                <select
                  id="listing_type"
                  name="listing_type"
                  value={formData.listing_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white text-[var(--foreground)]"
                >
                  <option value="rent">For Rent</option>
                  <option value="resale">Resale</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <PriceRangeInput
                  minPrice={formData.min_price}
                  maxPrice={formData.max_price}
                  onChange={({ min, max }) =>
                    setFormData((prev) => ({
                      ...prev,
                      min_price: min,
                      max_price: max,
                    }))
                  }
                />
                <div className="text-xs italic text-[var(--text-muted)] mt-2">
                  Enter min and max price using K (Thousand), L (Lakh), Cr
                  (Crore)
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
              Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="state"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleStateChange}
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white text-[var(--foreground)]"
                >
                  <option value="">Select State</option>
                  {uniqueStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  City *
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={!formData.state}
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white text-[var(--foreground)]"
                >
                  <option value="">Select City</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="area"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Area / Locality *
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Andheri West"
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Full Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123, ABC Street, Andheri West"
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="carpet_area"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Carpet Area
                </label>
                <input
                  type="text"
                  id="carpet_area"
                  name="carpet_area"
                  value={formData.carpet_area}
                  onChange={handleChange}
                  placeholder="e.g., 746-947 sqft"
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="config"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Configuration
                </label>
                <input
                  type="text"
                  id="config"
                  name="config"
                  value={formData.config}
                  onChange={handleChange}
                  placeholder="e.g., 2, 3 BHK"
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
              RERA & Legal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="rera_no"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  RERA Number
                </label>
                <input
                  type="text"
                  id="rera_no"
                  name="rera_no"
                  value={formData.rera_no}
                  onChange={handleChange}
                  placeholder="e.g., P52100047..."
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="possession_status"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Possession Status
                </label>
                <select
                  id="possession_status"
                  name="possession_status"
                  value={formData.possession_status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white text-[var(--foreground)]"
                >
                  <option value="">Select Status</option>
                  <option value="Pre-Launch">Pre-Launch</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Mid Stage">Mid Stage</option>
                  <option value="Nearing Possession">Nearing Possession</option>
                  <option value="Ready to Move">Ready to Move</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="target_possession"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Target Possession
                </label>
                <input
                  type="text"
                  id="target_possession"
                  name="target_possession"
                  value={formData.target_possession}
                  onChange={handleChange}
                  placeholder="e.g., Jun 2027"
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="md:col-span-2 flex items-center pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="litigation"
                    checked={formData.litigation}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-[var(--foreground)] font-medium group-hover:text-[var(--primary)] transition-colors">
                    Property under Litigation
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.47 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
              Owner Details *
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="owner_name"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Owner Name *
                </label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Enter property owner's full name"
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="owner_phone"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Owner Phone *
                </label>
                <input
                  type="tel"
                  id="owner_phone"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleChange}
                  placeholder="e.g., 9876543210"
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="owner_email"
                  className="block text-sm font-semibold text-[var(--foreground)]"
                >
                  Owner Email *
                </label>
                <input
                  type="email"
                  id="owner_email"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleChange}
                  placeholder="e.g., owner@example.com"
                  required
                  className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)] text-[var(--foreground)]"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Owner contact details will only be shared with verified admin
              staff for property verification.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
              Amenities
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {defaultAmenitiesWithIcons.map(({ name, Icon }) => (
                <motion.label
                  key={name}
                  className={`flex items-center gap-3 p-3 rounded-[var(--radius)] border cursor-pointer transition-all ${
                    amenities.includes(name)
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                      : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-soft)]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(name)}
                    onChange={() => toggleAmenity(name)}
                    className="hidden"
                  />
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{name}</span>
                </motion.label>
              ))}
            </div>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Add custom amenity..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomAmenity())
                }
                className="flex-1 px-4 py-3 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all placeholder:text-[var(--text-muted)]"
              />
              <motion.button
                type="button"
                onClick={addCustomAmenity}
                className="bg-[var(--foreground)] text-white px-6 rounded-[var(--radius)] font-medium hover:bg-black transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Add
              </motion.button>
            </div>

            {amenities.filter((a) => !defaultAmenityNames.includes(a)).length >
              0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Custom amenities:
                </p>
                <div className="flex flex-wrap gap-2">
                  {amenities
                    .filter((a) => !defaultAmenityNames.includes(a))
                    .map((amenity) => (
                      <motion.span
                        key={amenity}
                        className="inline-flex items-center gap-2 bg-[var(--surface-soft)] text-[var(--foreground)] px-3 py-1.5 rounded-full text-sm font-medium border border-[var(--border)]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2 pb-2 border-b border-[var(--border)]">
              Images
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Upload up to 10 images of your property
            </p>

            <div className="space-y-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                hidden
              />

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-square rounded-[var(--radius)] overflow-hidden border border-[var(--border)] group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <motion.button
                        type="button"
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        onClick={() => removeImage(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {images.length < 10 && (
                  <motion.button
                    type="button"
                    className="aspect-square flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border-2 border-dashed border-[var(--border-hover)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-8 h-8 opacity-50" />
                    <span className="text-sm font-medium">Add Images</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {images.length}/10
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2 pb-2 border-b border-[var(--border)]">
              Brochure (PDF)
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Upload up to 2 brochures (Max 10MB each)
            </p>

            <div className="space-y-6">
              <input
                type="file"
                ref={brochureInputRef}
                onChange={handleBrochureChange}
                accept="application/pdf"
                multiple
                hidden
              />

              <div className="flex flex-col gap-3">
                {brochures.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {brochureNames.map((name, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-soft)] relative group"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate text-[var(--foreground)]">
                            {name}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            PDF Document
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          onClick={() => removeBrochure(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {brochures.length < 2 && (
                  <motion.button
                    type="button"
                    className="w-full py-4 border-2 border-dashed border-[var(--border-hover)] rounded-[var(--radius)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all flex items-center justify-center gap-2"
                    onClick={() => brochureInputRef.current?.click()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Upload className="w-5 h-5 mx-auto md:mx-0" />
                    <span className="font-medium">Add Brochure</span>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {brochures.length}/2
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-end gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/"
                className="px-6 py-3 rounded-[var(--radius-full)] border border-[var(--border)] font-semibold text-[var(--foreground)] bg-white hover:bg-[var(--surface-soft)] transition-all"
              >
                Cancel
              </Link>
            </motion.div>
            <motion.button
              type="submit"
              className="px-8 py-3 rounded-[var(--radius-full)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={uploading}
              whileHover={{
                scale: uploading ? 1 : 1.02,
                y: uploading ? 0 : -2,
              }}
              whileTap={{ scale: uploading ? 1 : 0.98 }}
            >
              {uploading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </motion.span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Submit Property
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
