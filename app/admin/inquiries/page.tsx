"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  MessageSquare,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building,
  Search,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "@/lib/motion";

interface Inquiry {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  property?: {
    title: string;
    city: string;
    price: number;
  };
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select(
          `
          *,
          property:properties(title, city, price)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
      setInquiries(inquiries.filter((i) => i.id !== id));
      setDeleteId(null);
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      alert("Failed to delete inquiry");
    }
  }

  const filteredInquiries = inquiries.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ""
  );

  if (loading) {
    return (
      <div className="admin-page">
        <motion.div
          className="admin-loading-inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading inquiries...
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
          <h1>Inquiries</h1>
          <p>View and manage property inquiries</p>
        </div>
      </motion.div>

      <motion.div
        className="admin-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-search">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <motion.span
          className="admin-count"
          key={filteredInquiries.length}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {filteredInquiries.length} inquiries
        </motion.span>
      </motion.div>

      <motion.div
        className="inquiries-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Inquiries List */}
        <div className="inquiries-list">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry.id}
                className={`inquiry-card ${
                  selectedInquiry?.id === inquiry.id ? "active" : ""
                }`}
                onClick={() => setSelectedInquiry(inquiry)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                whileHover={{ x: 5 }}
              >
                <div className="inquiry-card-header">
                  <span className="inquiry-name">{inquiry.name}</span>
                  <span className="inquiry-date">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="inquiry-preview">
                  {inquiry.message.substring(0, 80)}...
                </p>
                {inquiry.property && (
                  <span className="inquiry-property">
                    {inquiry.property.title}
                  </span>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              className="empty-state-admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquare className="w-12 h-12 text-gray-300" />
              <p>No inquiries yet</p>
            </motion.div>
          )}
        </div>

        {/* Inquiry Detail */}
        <div className="inquiry-detail">
          <AnimatePresence mode="wait">
            {selectedInquiry ? (
              <motion.div
                key={selectedInquiry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inquiry-detail-header">
                  <h2>{selectedInquiry.name}</h2>
                  <motion.button
                    className="action-btn delete"
                    onClick={() => setDeleteId(selectedInquiry.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="inquiry-contact-info">
                  <motion.a
                    href={`mailto:${selectedInquiry.email}`}
                    className="contact-item"
                    whileHover={{ x: 5 }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{selectedInquiry.email}</span>
                  </motion.a>
                  <motion.a
                    href={`tel:${selectedInquiry.phone}`}
                    className="contact-item"
                    whileHover={{ x: 5 }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{selectedInquiry.phone}</span>
                  </motion.a>
                  <div className="contact-item">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedInquiry.property && (
                  <motion.div
                    className="inquiry-property-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Building className="w-5 h-5" />
                    <div>
                      <Link
                        href={`/properties/${selectedInquiry.property_id}`}
                        target="_blank"
                        className="property-link"
                      >
                        {selectedInquiry.property.title}
                      </Link>
                      <span className="property-meta">
                        {selectedInquiry.property.city} •{" "}
                        {formatPrice(selectedInquiry.property.price)}
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="inquiry-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h3>Message</h3>
                  <p>{selectedInquiry.message}</p>
                </motion.div>

                <motion.div
                  className="inquiry-actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.a
                    href={`mailto:${selectedInquiry.email}?subject=Re: Property Inquiry&body=Hi ${selectedInquiry.name},%0D%0A%0D%0AThank you for your inquiry.`}
                    className="btn-admin-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-4 h-4" />
                    Reply via Email
                  </motion.a>
                  <motion.a
                    href={`https://wa.me/${selectedInquiry.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}?text=Hi ${
                      selectedInquiry.name
                    }, thank you for your inquiry.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-admin-whatsapp"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reply via WhatsApp
                  </motion.a>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className="empty-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <MessageSquare className="w-16 h-16 text-gray-200" />
                <p>Select an inquiry to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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
              <h3>Delete Inquiry?</h3>
              <p>This action cannot be undone.</p>
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
