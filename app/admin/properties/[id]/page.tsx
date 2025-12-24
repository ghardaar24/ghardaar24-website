"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Upload, X, Save, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "@/lib/motion";

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

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    property_type: "apartment" as const,
    listing_type: "sale" as const,
    possession: "",
    featured: false,
    status: "active",
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Property not found");

        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          city: data.city || "",
          address: data.address || "",
          bedrooms: data.bedrooms?.toString() || "",
          bathrooms: data.bathrooms?.toString() || "",
          area_sqft: data.area_sqft?.toString() || "",
          property_type: data.property_type || "apartment",
          listing_type: data.listing_type || "sale",
          possession: data.possession || "immediate",
          featured: data.featured || false,
          status: data.status || "active",
        });
        setExistingImages(data.images || []);
        setAmenities(data.amenities || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load property"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

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
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

    for (const image of newImages) {
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
    setSaving(true);

    try {
      if (
        !formData.title ||
        !formData.price ||
        !formData.city ||
        !formData.address
      ) {
        throw new Error("Please fill in all required fields");
      }

      let allImages = [...existingImages];
      if (newImages.length > 0) {
        const uploadedUrls = await uploadImages();
        allImages = [...allImages, ...uploadedUrls];
      }

      const { error: updateError } = await supabase
        .from("properties")
        .update({
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
          status: formData.status,
          images: allImages,
          amenities: amenities,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      router.push("/admin/properties");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update property"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <motion.div
          className="admin-loading-inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading property...
        </motion.div>
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

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
          <h1>Edit Property</h1>
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="property_type">Property Type *</label>
              <select
                id="property_type"
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
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
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
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
                min="0"
              />
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
                {existingImages.map((url, index) => (
                  <motion.div
                    key={`existing-${index}`}
                    className="image-preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <motion.button
                      type="button"
                      className="remove-image"
                      onClick={() => removeExistingImage(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}

                {newImagePreviews.map((preview, index) => (
                  <motion.div
                    key={`new-${index}`}
                    className="image-preview new"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={preview}
                      alt={`New ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <motion.button
                      type="button"
                      className="remove-image"
                      onClick={() => removeNewImage(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {totalImages < 10 && (
                <motion.button
                  type="button"
                  className="upload-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02, borderColor: "var(--accent)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-6 h-6" />
                  <span>Add Images</span>
                  <span className="upload-hint">{totalImages}/10</span>
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
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.02, y: saving ? 0 : -2 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            {saving ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Saving...
              </motion.span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Property
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}
