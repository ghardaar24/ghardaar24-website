"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Upload, X, Save, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
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
  listing_type: "sale" | "rent";
  featured: boolean;
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
  featured: false,
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
        featured: formData.featured,
        images: imageUrls,
        amenities: amenities,
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
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Basic Information</h2>

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
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Location Details</h2>

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
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Property Details</h2>

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
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2>Amenities</h2>

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
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Images</h2>

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
                    <img src={preview} alt={`Preview ${index + 1}`} />
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
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2>Options</h2>

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
