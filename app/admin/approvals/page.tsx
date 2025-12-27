"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { Property } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Clock,
  User,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface PropertyWithSubmitter extends Property {
  submitter?: UserProfile;
}

type TabType = "pending" | "approved" | "rejected";

export default function AdminApprovalsPage() {
  const [properties, setProperties] = useState<PropertyWithSubmitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject";
    property: PropertyWithSubmitter;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [activeTab]);

  async function fetchProperties() {
    setLoading(true);
    try {
      // Fetch properties with the selected approval status
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("approval_status", activeTab)
        .order("submission_date", { ascending: false });

      if (propertiesError) throw propertiesError;

      if (!propertiesData || propertiesData.length === 0) {
        setProperties([]);
        return;
      }

      // Get unique submitter IDs
      const submitterIds = [
        ...new Set(
          propertiesData
            .filter((p) => p.submitted_by)
            .map((p) => p.submitted_by)
        ),
      ];

      // Fetch user profiles for submitters
      let userProfiles: Record<string, UserProfile> = {};
      if (submitterIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("user_profiles")
          .select("id, name, phone, email")
          .in("id", submitterIds);

        if (profilesData) {
          userProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, UserProfile>);
        }
      }

      // Combine properties with submitter info
      const propertiesWithSubmitters = propertiesData.map((property) => ({
        ...property,
        submitter: property.submitted_by
          ? userProfiles[property.submitted_by]
          : undefined,
      }));

      setProperties(propertiesWithSubmitters);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(propertyId: string) {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          approval_status: "approved",
          approval_date: new Date().toISOString(),
        })
        .eq("id", propertyId);

      if (error) throw error;

      setProperties(properties.filter((p) => p.id !== propertyId));
      setActionModal(null);
    } catch (error) {
      console.error("Error approving property:", error);
      alert("Failed to approve property");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(propertyId: string) {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          approval_status: "rejected",
          approval_date: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
        })
        .eq("id", propertyId);

      if (error) throw error;

      setProperties(properties.filter((p) => p.id !== propertyId));
      setActionModal(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting property:", error);
      alert("Failed to reject property");
    } finally {
      setProcessing(false);
    }
  }

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.submitter?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabCounts = {
    pending: properties.length,
    approved: 0,
    rejected: 0,
  };

  if (loading) {
    return (
      <div className="admin-page">
        <motion.div
          className="admin-loading-inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading submissions...
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
          <h1>Property Approvals</h1>
          <p>Review and approve user-submitted properties</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="approval-tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          className={`approval-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock className="w-4 h-4" />
          Pending
        </button>
        <button
          className={`approval-tab ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          <CheckCircle className="w-4 h-4" />
          Approved
        </button>
        <button
          className={`approval-tab ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          <XCircle className="w-4 h-4" />
          Rejected
        </button>
      </motion.div>

      {/* Search & Count */}
      <motion.div
        className="admin-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="admin-search">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, area, or submitter..."
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
          {filteredProperties.length} submissions
        </motion.span>
      </motion.div>

      {/* Properties List */}
      {filteredProperties.length > 0 ? (
        <motion.div
          className="approval-cards-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              className="approval-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="approval-card-image">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="approval-card-placeholder">
                    <AlertTriangle className="w-8 h-8" />
                    <span>No Image</span>
                  </div>
                )}
                <span className={`approval-badge ${property.listing_type}`}>
                  {property.listing_type === "rent" ? "For Rent" : "Resale"}
                </span>
              </div>

              <div className="approval-card-content">
                <h3 className="approval-card-title">{property.title}</h3>
                <p className="approval-card-location">{property.area}</p>
                <p className="approval-card-price">
                  {formatPrice(property.price)}
                </p>

                <div className="approval-card-meta">
                  <span className="capitalize">{property.property_type}</span>
                  {property.bedrooms > 0 && (
                    <span>{property.bedrooms} BHK</span>
                  )}
                  {property.carpet_area && <span>{property.carpet_area}</span>}
                </div>

                {property.submitter && (
                  <div className="approval-card-submitter">
                    <h4>Submitted by:</h4>
                    <div className="submitter-info">
                      <div className="submitter-row">
                        <User className="w-4 h-4" />
                        <span>{property.submitter.name}</span>
                      </div>
                      <div className="submitter-row">
                        <Phone className="w-4 h-4" />
                        <span>{property.submitter.phone}</span>
                      </div>
                      {property.submitter.email && (
                        <div className="submitter-row">
                          <Mail className="w-4 h-4" />
                          <span>{property.submitter.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {property.submission_date && (
                  <p className="approval-card-date">
                    Submitted:{" "}
                    {new Date(property.submission_date).toLocaleDateString()}
                  </p>
                )}

                {property.rejection_reason && activeTab === "rejected" && (
                  <div className="rejection-reason">
                    <strong>Rejection Reason:</strong>
                    <p>{property.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="approval-card-actions">
                <Link
                  href={`/admin/properties/${property.id}`}
                  className="action-btn-approval view"
                >
                  <Eye className="w-4 h-4" />
                  View / Edit
                </Link>
                {activeTab === "pending" && (
                  <>
                    <motion.button
                      className="action-btn-approval approve"
                      onClick={() =>
                        setActionModal({ type: "approve", property })
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </motion.button>
                    <motion.button
                      className="action-btn-approval reject"
                      onClick={() =>
                        setActionModal({ type: "reject", property })
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="empty-state-admin"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p>
            {activeTab === "pending"
              ? "No pending submissions"
              : activeTab === "approved"
              ? "No approved submissions yet"
              : "No rejected submissions"}
          </p>
        </motion.div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            className="admin-modal-overlay"
            onClick={() => setActionModal(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-modal approval-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {actionModal.type === "approve" ? (
                <>
                  <div className="modal-icon approve">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3>Approve Property?</h3>
                  <p>
                    This will make &quot;{actionModal.property.title}&quot;
                    visible on the public listings.
                  </p>
                </>
              ) : (
                <>
                  <div className="modal-icon reject">
                    <XCircle className="w-12 h-12" />
                  </div>
                  <h3>Reject Property?</h3>
                  <p>
                    This property will not be listed publicly. You can
                    optionally provide a reason.
                  </p>
                  <textarea
                    className="rejection-input"
                    placeholder="Reason for rejection (optional)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </>
              )}

              <div className="modal-actions">
                <motion.button
                  className="btn-admin-secondary"
                  onClick={() => {
                    setActionModal(null);
                    setRejectionReason("");
                  }}
                  disabled={processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={`btn-admin-${
                    actionModal.type === "approve" ? "success" : "danger"
                  }`}
                  onClick={() =>
                    actionModal.type === "approve"
                      ? handleApprove(actionModal.property.id)
                      : handleReject(actionModal.property.id)
                  }
                  disabled={processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {processing
                    ? "Processing..."
                    : actionModal.type === "approve"
                    ? "Approve"
                    : "Reject"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
