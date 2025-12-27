"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  Upload,
  X,
  Save,
  ArrowLeft,
  Plus,
  FileText,
  CheckCircle,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  defaultAmenitiesWithIcons,
  defaultAmenityNames,
} from "@/lib/amenityIcons";

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
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
}

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  price: "",
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

  useEffect(() => {
    fetchExistingAreas();
  }, []);

  async function fetchExistingAreas() {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("area")
        .eq("approval_status", "approved");

      if (error) throw error;

      if (data) {
        const uniqueAreas = Array.from(new Set(data.map((item) => item.area)))
          .filter((area) => area && area.trim().length > 0)
          .sort();

        setExistingAreas(uniqueAreas);
      }
    } catch (err) {
      console.error("Error fetching areas:", err);
    }
  }

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
        !formData.price ||
        !formData.area ||
        !formData.address
      ) {
        throw new Error("Please fill in all required fields");
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
        price: parseInt(formData.price),
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
        land_parcel: parseInt(formData.land_parcel) || 0,
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
      });

      if (insertError) throw insertError;

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          className="text-white text-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <motion.div
          className="submit-success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>
          <h1>Property Submitted Successfully!</h1>
          <p className="success-message">
            Thank you for submitting your property. Our team will review it and
            <strong> approve it within 2 business days</strong>.
          </p>
          <p className="success-note">
            You will be notified once your property is approved and listed on
            our platform.
          </p>
          <div className="success-actions">
            <Link href="/" className="btn-success-primary">
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <Link href="/properties" className="btn-success-secondary">
              Browse Properties
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="submit-property-page">
      <motion.div
        className="submit-property-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <Link href="/" className="back-link-submit">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1>Submit Your Property</h1>
          <p>List your property for rent or resale on Ghardaar24</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="submit-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <X className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="submit-info-banner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          <strong>Note:</strong> Submitted properties will be reviewed by our
          team and approved within 2 business days.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="submit-property-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Basic Information</h2>

          <div className="submit-form-grid">
            <div className="form-group full">
              <label htmlFor="title">Property Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern 3BHK Apartment in Andheri West"
                required
              />
            </div>

            <div className="form-group full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your property..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="property_type">Property Type *</label>
              <select
                id="property_type"
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                required
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="listing_type">Listing Type *</label>
              <select
                id="listing_type"
                name="listing_type"
                value={formData.listing_type}
                onChange={handleChange}
                required
              >
                <option value="rent">For Rent</option>
                <option value="resale">Resale</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 5000000"
                required
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Location Details</h2>

          <div className="submit-form-grid">
            <div className="form-group">
              <label htmlFor="area">Area *</label>
              <div className="relative">
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  list="area-suggestions"
                  placeholder="Enter or select Area"
                  required
                  className="w-full"
                  autoComplete="off"
                />
                <datalist id="area-suggestions">
                  {existingAreas.map((area) => (
                    <option key={area} value={area} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group full">
              <label htmlFor="address">Full Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123, ABC Street, Andheri West"
                required
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Property Details</h2>

          <div className="submit-form-grid">
            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="carpet_area">Carpet Area</label>
              <input
                type="text"
                id="carpet_area"
                name="carpet_area"
                value={formData.carpet_area}
                onChange={handleChange}
                placeholder="e.g., 746-947 sqft"
              />
            </div>

            <div className="form-group">
              <label htmlFor="config">Configuration</label>
              <input
                type="text"
                id="config"
                name="config"
                value={formData.config}
                onChange={handleChange}
                placeholder="e.g., 2, 3 BHK"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <h2>RERA & Legal Details</h2>

          <div className="submit-form-grid">
            <div className="form-group">
              <label htmlFor="rera_no">RERA Number</label>
              <input
                type="text"
                id="rera_no"
                name="rera_no"
                value={formData.rera_no}
                onChange={handleChange}
                placeholder="e.g., P52100047..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="possession_status">Possession Status</label>
              <select
                id="possession_status"
                name="possession_status"
                value={formData.possession_status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Pre-Launch">Pre-Launch</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Mid Stage">Mid Stage</option>
                <option value="Nearing Possession">Nearing Possession</option>
                <option value="Ready to Move">Ready to Move</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="target_possession">Target Possession</label>
              <input
                type="text"
                id="target_possession"
                name="target_possession"
                value={formData.target_possession}
                onChange={handleChange}
                placeholder="e.g., Jun 2027"
              />
            </div>

            <div className="form-group full">
              <label className="checkbox-label-submit">
                <input
                  type="checkbox"
                  name="litigation"
                  checked={formData.litigation}
                  onChange={handleChange}
                />
                <span>Property under Litigation</span>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2>Amenities</h2>

          <div className="amenities-grid-submit">
            {defaultAmenitiesWithIcons.map(({ name, Icon }) => (
              <motion.label
                key={name}
                className={`amenity-checkbox-submit ${
                  amenities.includes(name) ? "selected" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(name)}
                  onChange={() => toggleAmenity(name)}
                />
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </motion.label>
            ))}
          </div>

          <div className="custom-amenity-input-submit">
            <input
              type="text"
              placeholder="Add custom amenity..."
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomAmenity())
              }
            />
            <motion.button
              type="button"
              onClick={addCustomAmenity}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Add
            </motion.button>
          </div>

          {amenities.filter((a) => !defaultAmenityNames.includes(a)).length >
            0 && (
            <div className="custom-amenities-submit">
              <p className="custom-amenities-label">Custom amenities:</p>
              <div className="custom-amenities-list-submit">
                {amenities
                  .filter((a) => !defaultAmenityNames.includes(a))
                  .map((amenity) => (
                    <motion.span
                      key={amenity}
                      className="custom-amenity-tag-submit"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
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
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Images</h2>
          <p className="section-hint">
            Upload up to 10 images of your property
          </p>

          <div className="image-upload-area-submit">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              hidden
            />

            <div className="image-previews-submit">
              <AnimatePresence>
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    className="image-preview-submit"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <motion.button
                      type="button"
                      className="remove-image-submit"
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
                  className="upload-trigger-submit"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-6 h-6" />
                  <span>Add Images</span>
                  <span className="upload-hint-submit">{images.length}/10</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="submit-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h2>Brochure (PDF)</h2>
          <p className="section-hint">
            Upload up to 2 brochures (Max 10MB each)
          </p>

          <div className="brochure-upload-area-submit">
            <input
              type="file"
              ref={brochureInputRef}
              onChange={handleBrochureChange}
              accept="application/pdf"
              multiple
              hidden
            />

            {brochures.length > 0 && (
              <div className="brochure-list-submit">
                {brochureNames.map((name, index) => (
                  <motion.div
                    key={index}
                    className="brochure-preview-submit"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="brochure-info-submit">
                      <span className="brochure-name">{name}</span>
                      <span className="brochure-size">PDF Document</span>
                    </div>
                    <motion.button
                      type="button"
                      className="remove-brochure-submit"
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
                className="upload-trigger-submit"
                onClick={() => brochureInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="w-6 h-6" />
                <span>Add Brochure</span>
                <span className="upload-hint-submit">{brochures.length}/2</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div
          className="submit-form-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="btn-submit-secondary">
              Cancel
            </Link>
          </motion.div>
          <motion.button
            type="submit"
            className="btn-submit-primary"
            disabled={uploading}
            whileHover={{ scale: uploading ? 1 : 1.02, y: uploading ? 0 : -2 }}
            whileTap={{ scale: uploading ? 1 : 0.98 }}
          >
            {uploading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
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
  );
}
