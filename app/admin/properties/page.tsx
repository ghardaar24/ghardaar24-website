"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseAdmin as supabase, Property } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Star, Eye, Search, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

type SortKey = "created_at_desc" | "created_at_asc" | "price_asc" | "price_desc" | "title_asc" | "title_desc" | "cp_slab_asc" | "cp_slab_desc";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at_desc");
  const [filterType, setFilterType] = useState("");
  const [filterListing, setFilterListing] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      setProperties(properties.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error deleting property:", error);
      alert("Failed to delete property");
    }
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ featured: !currentValue })
        .eq("id", id);

      if (error) throw error;
      setProperties(
        properties.map((p) =>
          p.id === id ? { ...p, featured: !currentValue } : p
        )
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error updating property:", error);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setFilterType("");
    setFilterListing("");
    setFilterFeatured("");
    setSortKey("created_at_desc");
  }

  const hasActiveFilters = searchQuery || filterType || filterListing || filterFeatured || sortKey !== "created_at_desc";

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !filterType || p.property_type === filterType;
      const matchListing = !filterListing || p.listing_type === filterListing;
      const matchFeatured =
        !filterFeatured ||
        (filterFeatured === "yes" ? p.featured : !p.featured);
      return matchSearch && matchType && matchListing && matchFeatured;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "created_at_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "price_asc":
          return (a.min_price || a.price || 0) - (b.min_price || b.price || 0);
        case "price_desc":
          return (b.min_price || b.price || 0) - (a.min_price || a.price || 0);
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "cp_slab_asc":
          return (a.cp_slab || "").localeCompare(b.cp_slab || "");
        case "cp_slab_desc":
          return (b.cp_slab || "").localeCompare(a.cp_slab || "");
        default: // created_at_desc
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [properties, searchQuery, filterType, filterListing, filterFeatured, sortKey]);

  if (loading) {
    return (
      <div className="admin-page">
        <motion.div
          className="admin-loading-inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading properties...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1>Properties</h1>
          <p>Manage all your property listings</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/admin/properties/new" className="btn-admin-primary">
            <Plus className="w-5 h-5" />
            Add Property
          </Link>
        </motion.div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="admin-toolbar admin-toolbar-extended"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-toolbar-row">
          <div className="admin-search">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <motion.span
            className="admin-count"
            key={filteredProperties.length}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {filteredProperties.length} of {properties.length}
          </motion.span>
        </div>
        <div className="admin-toolbar-row admin-filters-row">
          <div className="admin-filter-group">
            <ArrowUpDown className="w-4 h-4" />
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="title_asc">Title: A → Z</option>
              <option value="title_desc">Title: Z → A</option>
              <option value="cp_slab_asc">CP Slab: A → Z</option>
              <option value="cp_slab_desc">CP Slab: Z → A</option>
            </select>
          </div>
          <div className="admin-filter-group">
            <SlidersHorizontal className="w-4 h-4" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div className="admin-filter-group">
            <select value={filterListing} onChange={(e) => setFilterListing(e.target.value)}>
              <option value="">All Listings</option>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
              <option value="resale">Resale</option>
            </select>
          </div>
          <div className="admin-filter-group">
            <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
              <option value="">All</option>
              <option value="yes">Featured</option>
              <option value="no">Not Featured</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button className="admin-filter-clear" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Properties Table & Mobile Cards */}
      {filteredProperties.length > 0 ? (
        <motion.div
          className="admin-section-card properties-section-responsive"
          style={{ padding: 0 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Desktop Table View */}
          <div className="admin-table-container properties-table-desktop">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Area</th>
                  <th>Type</th>
                  <th>Listing</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property, index) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <td>
                      <div className="table-property">
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-200 shrink-0">
                          {property.images?.[0] && (
                            <Image
                              src={property.images[0]}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="table-property-title">
                          {property.title}
                        </span>
                      </div>
                    </td>
                    <td>{property.area}</td>
                    <td className="capitalize">{property.property_type}</td>
                    <td className="capitalize">{property.listing_type}</td>
                    <td>{formatPrice(property.price)}</td>
                    <td>
                      <motion.button
                        className={`featured-toggle ${
                          property.featured ? "active" : ""
                        }`}
                        onClick={() =>
                          toggleFeatured(property.id, !!property.featured)
                        }
                        title={
                          property.featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star className="w-5 h-5" />
                      </motion.button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Link
                            href={`/properties/${property.id}`}
                            target="_blank"
                            className="action-btn view"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Link
                            href={`/admin/properties/${property.id}`}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </motion.div>
                        <motion.button
                          className="action-btn delete"
                          onClick={() => setDeleteId(property.id)}
                          title="Delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ color: "#dc2626" }}
                        >
                          <Trash2 style={{ width: 16, height: 16, color: "#dc2626", display: "block" }} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="properties-cards-mobile">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="property-card-admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="property-card-admin-header">
                  <div className="property-card-admin-image">
                    {property.images?.[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="property-card-admin-placeholder">
                        <Plus className="w-6 h-6" />
                      </div>
                    )}
                    {property.featured && (
                      <span className="property-card-admin-featured">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="property-card-admin-info">
                    <h3 className="property-card-admin-title">
                      {property.title}
                    </h3>
                    <p className="property-card-admin-area">{property.area}</p>
                    <div className="property-card-admin-meta">
                      <span className="property-card-admin-type capitalize">
                        {property.property_type}
                      </span>
                      <span className="property-card-admin-listing capitalize">
                        {property.listing_type}
                      </span>
                    </div>
                    <p className="property-card-admin-price">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </div>
                <div className="property-card-admin-actions">
                  <motion.button
                    className={`featured-toggle-mobile ${
                      property.featured ? "active" : ""
                    }`}
                    onClick={() =>
                      toggleFeatured(property.id, !!property.featured)
                    }
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star className="w-4 h-4" />
                    {property.featured ? "Featured" : "Feature"}
                  </motion.button>
                  <Link
                    href={`/properties/${property.id}`}
                    target="_blank"
                    className="action-btn-mobile view"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="action-btn-mobile edit"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    className="action-btn-mobile delete"
                    onClick={() => setDeleteId(property.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="empty-state-admin"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p>No properties found</p>
          <Link href="/admin/properties/new" className="btn-admin-primary">
            Add Your First Property
          </Link>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="admin-modal-overlay"
            onClick={() => setDeleteId(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Delete Property?</h3>
              <p>
                This action cannot be undone. All data including images will be
                permanently deleted.
              </p>
              <div className="modal-actions">
                <motion.button
                  className="btn-admin-secondary"
                  onClick={() => setDeleteId(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn-admin-danger"
                  onClick={() => handleDelete(deleteId)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
