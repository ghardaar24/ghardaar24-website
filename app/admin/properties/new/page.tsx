"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Upload, X, Save, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "@/lib/motion";

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  city: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
  property_type: "apartment" | "house" | "villa" | "plot" | "commercial";
  listing_type: "sale" | "rent" | "resale";
  possession: string;
  featured: boolean;
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
  rera_possession: string;
  litigation: boolean;
}

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  price: "",
  city: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  area_sqft: "",
  property_type: "apartment",
  listing_type: "sale",
  possession: "",
  featured: false,
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
  rera_possession: "",
  litigation: false,
};

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

const defaultAmenities = [
  "Parking",
  "Swimming Pool",
  "Gym",
  "Security",
  "Power Backup",
  "Lift",
  "Garden",
  "Club House",
  "Children's Play Area",
  "CCTV",
  "Intercom",
  "Fire Safety",
  "Rainwater Harvesting",
  "Visitor Parking",
  "Maintenance Staff",
];

export default function NewPropertyPage() {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      setError("Maximum 10 images allowed");
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
      const fileName = `${Date.now()}-${Math.random()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.price ||
        !formData.city ||
        !formData.address
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Upload images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      // Insert property
      const { error: insertError } = await supabase.from("properties").insert({
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        city: formData.city,
        address: formData.address,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area_sqft: parseInt(formData.area_sqft) || 0,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        possession: formData.possession,
        featured: formData.featured,
        images: imageUrls,
        amenities: amenities,
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
        rera_possession: formData.rera_possession,
        litigation: formData.litigation,
      });

      if (insertError) throw insertError;

      router.push("/admin/properties");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create property"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <Link href="/admin/properties" className="back-link-admin">
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </Link>
          <h1>Add New Property</h1>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="admin-error"
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

      <motion.form
        onSubmit={handleSubmit}
        className="property-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Basic Information
          </h2>

          <div className="form-grid">
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
                placeholder="Describe the property..."
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
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="resale">Resale</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="possession">Possession</label>
              <select
                id="possession"
                name="possession"
                value={formData.possession}
                onChange={handleChange}
              >
                <option value="">Select Possession</option>
                <option value="Immediate">Immediate</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
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
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Location Details
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
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
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Property Details
          </h2>

          <div className="form-grid">
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
              <label htmlFor="area_sqft">Area (Sq. Ft.)</label>
              <input
                type="number"
                id="area_sqft"
                name="area_sqft"
                value={formData.area_sqft}
                onChange={handleChange}
                placeholder="e.g., 1200"
                min="0"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Project Details
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="land_parcel">Land Parcel</label>
              <input
                type="number"
                id="land_parcel"
                name="land_parcel"
                value={formData.land_parcel}
                onChange={handleChange}
                placeholder="e.g., 8"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="towers">Towers</label>
              <input
                type="number"
                id="towers"
                name="towers"
                value={formData.towers}
                onChange={handleChange}
                placeholder="e.g., 6"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="floors">Floors</label>
              <input
                type="text"
                id="floors"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                placeholder="e.g., G+3P+22"
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
          </div>
        </motion.div>

        <motion.div
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            RERA & Legal Details
          </h2>

          <div className="form-grid">
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

            <div className="form-group">
              <label htmlFor="rera_possession">RERA Possession</label>
              <input
                type="text"
                id="rera_possession"
                name="rera_possession"
                value={formData.rera_possession}
                onChange={handleChange}
                placeholder="e.g., Jun 2028"
              />
            </div>

            <div className="form-group full">
              <label className="checkbox-label">
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
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Amenities
          </h2>

          <div className="amenities-grid">
            {defaultAmenities.map((amenity) => (
              <motion.label
                key={amenity}
                className={`amenity-checkbox ${
                  amenities.includes(amenity) ? "selected" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <span>{amenity}</span>
              </motion.label>
            ))}
          </div>

          <div className="custom-amenity-input">
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

          {amenities.filter((a) => !defaultAmenities.includes(a)).length >
            0 && (
            <div className="custom-amenities">
              <p className="custom-amenities-label">Custom amenities:</p>
              <div className="custom-amenities-list">
                {amenities
                  .filter((a) => !defaultAmenities.includes(a))
                  .map((amenity) => (
                    <motion.span
                      key={amenity}
                      className="custom-amenity-tag"
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
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Images
          </h2>

          <div className="image-upload-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              hidden
            />

            <div className="image-previews">
              <AnimatePresence>
                {imagePreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    className="image-preview"
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
                      className="remove-image"
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
                  className="upload-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02, borderColor: "var(--accent)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-6 h-6" />
                  <span>Add Images</span>
                  <span className="upload-hint">{images.length}/10</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="admin-section-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Options
          </h2>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            <span>Mark as Featured Property</span>
          </label>
        </motion.div>

        <motion.div
          className="form-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/admin/properties" className="btn-admin-secondary">
              Cancel
            </Link>
          </motion.div>
          <motion.button
            type="submit"
            className="btn-admin-primary"
            disabled={uploading}
            whileHover={{ scale: uploading ? 1 : 1.02, y: uploading ? 0 : -2 }}
            whileTap={{ scale: uploading ? 1 : 0.98 }}
          >
            {uploading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Saving...
              </motion.span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Property
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}
