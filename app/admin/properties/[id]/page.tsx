"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { Upload, X, Save, ArrowLeft, Plus, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  defaultAmenitiesWithIcons,
  defaultAmenityNames,
} from "@/lib/amenityIcons";

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
    area: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    property_type: "apartment" as const,
    listing_type: "sale" as const,
    featured: false,
    status: "active",
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
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingAreas, setExistingAreas] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [brochures, setBrochures] = useState<File[]>([]);
  const [brochureNames, setBrochureNames] = useState<string[]>([]);
  const [existingBrochureUrls, setExistingBrochureUrls] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
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
          area: data.area || "",
          address: data.address || "",
          bedrooms: data.bedrooms?.toString() || "",
          bathrooms: data.bathrooms?.toString() || "",
          property_type: data.property_type || "apartment",
          listing_type: data.listing_type || "sale",
          featured: data.featured || false,
          status: data.status || "active",
          // Project Details
          land_parcel: data.land_parcel?.toString() || "",
          towers: data.towers?.toString() || "",
          floors: data.floors || "",
          config: data.config || "",
          carpet_area: data.carpet_area || "",
          // RERA & Legal Details
          rera_no: data.rera_no || "",
          possession_status: data.possession_status || "",
          target_possession: data.target_possession || "",
          litigation: data.litigation || false,
        });
        setExistingImages(data.images || []);
        setAmenities(data.amenities || []);
        if (data.brochure_urls && Array.isArray(data.brochure_urls)) {
          setExistingBrochureUrls(data.brochure_urls);
        } else if (data.brochure_url) {
          setExistingBrochureUrls([data.brochure_url]);
        }
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

  useEffect(() => {
    fetchExistingAreas();
  }, []);

  async function fetchExistingAreas() {
    try {
      const { data, error } = await supabase.from("properties").select("area");

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
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 25) {
      setError("Maximum 25 images allowed");
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

  const uploadBrochures = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const brochure of brochures) {
      const fileName = `${Date.now()}-${Math.random()
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
    const totalBrochures =
      existingBrochureUrls.length + brochures.length + files.length;

    if (totalBrochures > 5) {
      setError("Maximum 5 brochures allowed");
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

  const removeNewBrochure = (index: number) => {
    setBrochures((prev) => prev.filter((_, i) => i !== index));
    setBrochureNames((prev) => prev.filter((_, i) => i !== index));
    if (brochureInputRef.current) {
      brochureInputRef.current.value = "";
    }
  };

  const removeExistingBrochure = (index: number) => {
    setExistingBrochureUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (
        !formData.title ||
        !formData.price ||
        !formData.area ||
        !formData.address
      ) {
        throw new Error("Please fill in all required fields");
      }

      let allImages = [...existingImages];
      if (newImages.length > 0) {
        const uploadedUrls = await uploadImages();
        allImages = [...allImages, ...uploadedUrls];
      }

      // Handle brochures
      let allBrochureUrls = [...existingBrochureUrls];
      if (brochures.length > 0) {
        const uploadedBrochureUrls = await uploadBrochures();
        allBrochureUrls = [...allBrochureUrls, ...uploadedBrochureUrls];
      }

      const { error: updateError } = await supabase
        .from("properties")
        .update({
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          area: formData.area,
          address: formData.address,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          property_type: formData.property_type,
          listing_type: formData.listing_type,
          featured: formData.featured,
          status: formData.status,
          images: allImages,
          amenities: amenities,
          brochure_urls: allBrochureUrls,
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
        })
        .eq("id", id);

      if (updateError) throw updateError;

      router.push("/admin/properties");
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update property";
      const errorDetails = (err as { details?: string })?.details;
      setError(
        errorDetails ? `${errorMessage} - ${errorDetails}` : errorMessage
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
  const totalBrochures = existingBrochureUrls.length + brochures.length;

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
            {defaultAmenitiesWithIcons.map(({ name, Icon }) => (
              <motion.label
                key={name}
                className={`amenity-checkbox ${
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

          {amenities.filter((a) => !defaultAmenityNames.includes(a)).length >
            0 && (
            <div className="custom-amenities">
              <p className="custom-amenities-label">Custom amenities:</p>
              <div className="custom-amenities-list">
                {amenities
                  .filter((a) => !defaultAmenityNames.includes(a))
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
          transition={{ delay: 0.55 }}
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
            Brochure (PDF)
          </h2>

          <div className="brochure-upload-area">
            <input
              type="file"
              ref={brochureInputRef}
              onChange={handleBrochureChange}
              accept="application/pdf"
              multiple
              hidden
            />

            {(existingBrochureUrls.length > 0 || brochures.length > 0) && (
              <div className="brochure-list space-y-2 mb-4">
                {existingBrochureUrls.map((url, index) => (
                  <motion.div
                    key={`existing-${index}`}
                    className="brochure-preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="brochure-info">
                      <span className="brochure-name">
                        {url.split("/").pop() || "Brochure.pdf"}
                      </span>
                      <span className="brochure-size">Existing PDF</span>
                    </div>
                    <motion.button
                      type="button"
                      className="remove-brochure"
                      onClick={() => removeExistingBrochure(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}

                {brochureNames.map((name, index) => (
                  <motion.div
                    key={`new-${index}`}
                    className="brochure-preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="brochure-info">
                      <span className="brochure-name">{name}</span>
                      <span className="brochure-size">New PDF</span>
                    </div>
                    <motion.button
                      type="button"
                      className="remove-brochure"
                      onClick={() => removeNewBrochure(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {totalBrochures < 5 && (
              <motion.button
                type="button"
                className="upload-trigger"
                onClick={() => brochureInputRef.current?.click()}
                whileHover={{ scale: 1.02, borderColor: "var(--accent)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="w-6 h-6" />
                <span>Add Brochure</span>
                <span className="upload-hint">
                  {totalBrochures}/5 (Max 10MB PDF)
                </span>
              </motion.button>
            )}
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
