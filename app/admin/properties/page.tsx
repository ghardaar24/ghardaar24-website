"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseAdmin as supabase, Property } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Star, Eye, Search, ArrowUpDown, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/admin/PageHeader";

type SortKey = "created_at_desc" | "created_at_asc" | "price_asc" | "price_desc" | "title_asc" | "title_desc" | "cp_slab_asc" | "cp_slab_desc";

const DEFAULT_ITEMS_PER_PAGE = 50;
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

const SORT_LABELS: Record<SortKey, string> = {
  created_at_desc: "Newest First",
  created_at_asc: "Oldest First",
  price_desc: "Price: High → Low",
  price_asc: "Price: Low → High",
  title_asc: "Title: A → Z",
  title_desc: "Title: Z → A",
  cp_slab_asc: "Brokerage %: A → Z",
  cp_slab_desc: "Brokerage %: Z → A",
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at_desc");
  const [filterType, setFilterType] = useState("");
  const [filterListing, setFilterListing] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");
  const [filterLitigation, setFilterLitigation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

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
    setFilterLitigation("");
    setSortKey("created_at_desc");
  }

  const hasActiveFilters = searchQuery || filterType || filterListing || filterFeatured || filterLitigation || sortKey !== "created_at_desc";

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
      const matchLitigation =
        !filterLitigation ||
        (filterLitigation === "yes" ? p.litigation : !p.litigation);
      return matchSearch && matchType && matchListing && matchFeatured && matchLitigation;
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
  }, [properties, searchQuery, filterType, filterListing, filterFeatured, filterLitigation, sortKey]);

  // Reset page on filter/sort/page-size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterListing, filterFeatured, filterLitigation, sortKey, itemsPerPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Listings"
        title="Properties"
        description="Every listing on the site."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="btn-admin-primary" render={<Link href="/admin/properties/new" />}>
                <Plus className="w-5 h-5" />
                Add Property
              </Button>
            </motion.div>
          </>
        }
      />

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
            <Input
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
            <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: SortKey) => SORT_LABELS[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="title_asc">Title: A → Z</SelectItem>
                <SelectItem value="title_desc">Title: Z → A</SelectItem>
                <SelectItem value="cp_slab_asc">Brokerage %: A → Z</SelectItem>
                <SelectItem value="cp_slab_desc">Brokerage %: Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="admin-filter-group">
            <SlidersHorizontal className="w-4 h-4" />
            <Select value={filterType} onValueChange={(value) => value && setFilterType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="admin-filter-group">
            <Select value={filterListing} onValueChange={(value) => value && setFilterListing(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Listings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="resale">Resale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="admin-filter-group">
            <Select value={filterFeatured} onValueChange={(value) => value && setFilterFeatured(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Featured</SelectItem>
                <SelectItem value="no">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="admin-filter-group">
            <Select value={filterLitigation} onValueChange={(value) => value && setFilterLitigation(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Litigation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Litigation</SelectItem>
                <SelectItem value="no">No Litigation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" className="admin-filter-clear" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
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
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProperties.map((property, index) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{property.area}</TableCell>
                    <TableCell className="capitalize">{property.property_type}</TableCell>
                    <TableCell className="capitalize">{property.listing_type}</TableCell>
                    <TableCell>{formatPrice(property.price)}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="properties-cards-mobile">
            {paginatedProperties.map((property, index) => (
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

          {/* Pagination Controls */}
          <div className="crm-pagination">
            <div className="crm-pagination-info">
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
              <strong>{Math.min(currentPage * itemsPerPage, filteredProperties.length)}</strong>{" "}
              of <strong>{filteredProperties.length}</strong> properties
            </div>
            <div className="crm-pagination-controls">
              <div className="pagination-size-select">
                <span>Rows per page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="pagination-size-select-input"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="crm-pagination-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <div className="crm-pagination-page-input">
                    <span>Page</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value, 10);
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      onBlur={(e) => {
                        const page = parseInt(e.target.value, 10);
                        if (isNaN(page) || page < 1) {
                          setCurrentPage(1);
                        } else if (page > totalPages) {
                          setCurrentPage(totalPages);
                        }
                      }}
                      className="crm-page-input"
                    />
                    <span>of {totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="crm-pagination-btn"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="empty-state-admin"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p>No properties found</p>
          <Button className="btn-admin-primary" render={<Link href="/admin/properties/new" />}>
            Add Your First Property
          </Button>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data including images will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" className="btn-admin-secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="btn-admin-danger"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
