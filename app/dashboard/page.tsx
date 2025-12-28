"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Property } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Home,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

type StatusTab = "all" | "pending" | "approved" | "rejected";

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.id) {
      fetchUserProperties();
    }
  }, [user?.id]);

  async function fetchUserProperties() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("submitted_by", user?.id)
        .order("submission_date", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties =
    activeTab === "all"
      ? properties
      : properties.filter((p) => p.approval_status === activeTab);

  const statusCounts = {
    all: properties.length,
    pending: properties.filter((p) => p.approval_status === "pending").length,
    approved: properties.filter((p) => p.approval_status === "approved").length,
    rejected: properties.filter((p) => p.approval_status === "rejected").length,
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="dashboard-status-badge pending">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="dashboard-status-badge approved">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="dashboard-status-badge rejected">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
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

  return (
    <div className="dashboard-page">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-header-content">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1>My Dashboard</h1>
            <p>Welcome back, {userProfile?.name || "User"}!</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/properties/submit" className="dashboard-submit-btn">
              <Plus className="w-5 h-5" />
              Submit New Property
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="dashboard-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="dashboard-stat-card">
          <Building2 className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.all}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
        </div>
        <div className="dashboard-stat-card pending">
          <Clock className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.pending}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="dashboard-stat-card approved">
          <CheckCircle className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="dashboard-stat-card rejected">
          <XCircle className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="dashboard-tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button
          className={`dashboard-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({statusCounts.all})
        </button>
        <button
          className={`dashboard-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock className="w-4 h-4" />
          Pending ({statusCounts.pending})
        </button>
        <button
          className={`dashboard-tab ${
            activeTab === "approved" ? "active" : ""
          }`}
          onClick={() => setActiveTab("approved")}
        >
          <CheckCircle className="w-4 h-4" />
          Approved ({statusCounts.approved})
        </button>
        <button
          className={`dashboard-tab ${
            activeTab === "rejected" ? "active" : ""
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          <XCircle className="w-4 h-4" />
          Rejected ({statusCounts.rejected})
        </button>
      </motion.div>

      {/* Properties List */}
      {loading ? (
        <motion.div
          className="dashboard-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading your properties...
        </motion.div>
      ) : filteredProperties.length > 0 ? (
        <motion.div
          className="dashboard-properties-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="dashboard-property-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="dashboard-property-image">
                  {property.images?.[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="dashboard-property-placeholder">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                  {getStatusBadge(property.approval_status)}
                  <span
                    className={`dashboard-listing-badge ${property.listing_type}`}
                  >
                    {property.listing_type === "rent" ? "For Rent" : "Resale"}
                  </span>
                </div>

                <div className="dashboard-property-content">
                  <h3 className="dashboard-property-title">{property.title}</h3>

                  <div className="dashboard-property-location">
                    <MapPin className="w-4 h-4" />
                    <span>{property.area}</span>
                  </div>

                  <p className="dashboard-property-price">
                    {formatPrice(property.price)}
                  </p>

                  <div className="dashboard-property-meta">
                    <span className="capitalize">{property.property_type}</span>
                    {property.bedrooms > 0 && (
                      <span>{property.bedrooms} BHK</span>
                    )}
                    {property.carpet_area && (
                      <span>{property.carpet_area}</span>
                    )}
                  </div>

                  {property.submission_date && (
                    <div className="dashboard-property-date">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Submitted{" "}
                        {new Date(
                          property.submission_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {property.rejection_reason &&
                    property.approval_status === "rejected" && (
                      <div className="dashboard-rejection-reason">
                        <AlertTriangle className="w-4 h-4" />
                        <div>
                          <strong>Rejection Reason:</strong>
                          <p>{property.rejection_reason}</p>
                        </div>
                      </div>
                    )}

                  {property.approval_status === "approved" && (
                    <div className="dashboard-property-actions">
                      <Link
                        href={`/properties/${property.id}`}
                        className="dashboard-view-btn"
                      >
                        View Listing
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="dashboard-empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Building2 className="w-16 h-16" />
          <h3>
            {activeTab === "all"
              ? "No Properties Submitted Yet"
              : `No ${activeTab} Properties`}
          </h3>
          <p>
            {activeTab === "all"
              ? "Start by submitting your first property for listing."
              : `You don't have any ${activeTab} properties.`}
          </p>
          <Link href="/properties/submit" className="dashboard-empty-btn">
            <Plus className="w-5 h-5" />
            Submit Your First Property
          </Link>
        </motion.div>
      )}
    </div>
  );
}
