"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  MessageSquare,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building,
  Search,
  Compass,
  Landmark,
  Palette,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/admin/PageHeader";

interface Inquiry {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  inquiry_type?: 'property' | 'home_loan' | 'interior_design' | 'vastu_consultation';
  service_details?: {
    employment_type?: string;
    monthly_income?: string;
    loan_amount?: string;
    property_type?: string;
    preferred_banks?: string;
    property_size?: string;
    rooms_to_design?: string[];
    design_style?: string;
    budget_range?: string;
    timeline?: string;
    consultation_type?: string;
    preferred_date?: string;
    property_address?: string;
    issues?: string[];
  };
  property?: {
    title: string;
    area: string;
    price: number;
  };
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'property' | 'home_loan' | 'interior_design' | 'vastu_consultation'>('all');

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
          property:properties(title, area, price)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error fetching inquiries:", error);
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
      if (process.env.NODE_ENV === "development") console.error("Error deleting inquiry:", error);
      alert("Failed to delete inquiry");
    }
  }

  const getInquiryTypeLabel = (type?: string) => {
    switch (type) {
      case 'home_loan': return 'Home Loan';
      case 'interior_design': return 'Interior Design';
      case 'vastu_consultation': return 'Vastu Consultation';
      default: return 'Property';
    }
  };

  const getInquiryTypeIcon = (type?: string) => {
    switch (type) {
      case 'home_loan': return Landmark;
      case 'interior_design': return Palette;
      case 'vastu_consultation': return Compass;
      default: return Building;
    }
  };

  const filteredInquiries = inquiries.filter((i) => {
    const matchesSearch = 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.property?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      typeFilter === 'all' || 
      (i.inquiry_type || 'property') === typeFilter;
    
    return matchesSearch && matchesType;
  });

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
        eyebrow="People"
        title="Inquiries"
        description="Messages from people interested in a property."
      />

      <motion.div
        className="admin-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-search">
          <Search className="w-5 h-5" />
          <Input
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

      {/* Filter Tabs */}
      <motion.div
        className="admin-filter-tabs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {(['all', 'property', 'home_loan', 'interior_design', 'vastu_consultation'] as const).map((filter) => (
          <Button
            key={filter}
            type="button"
            variant="ghost"
            className={`admin-filter-tab ${typeFilter === filter ? 'active' : ''}`}
            onClick={() => setTypeFilter(filter)}
          >
            {filter === 'all' ? 'All' : getInquiryTypeLabel(filter)}
            <span style={{ marginLeft: '0.375rem', opacity: 0.7, fontSize: '0.75rem' }}>
              ({filter === 'all'
                ? inquiries.length
                : inquiries.filter(i => (i.inquiry_type || 'property') === filter).length})
            </span>
          </Button>
        ))}
      </motion.div>

      <motion.div
        className="inquiries-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Inquiries List */}
        <div className="inquiries-list admin-section-card">
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
                  {inquiry.message?.substring(0, 80) || 'No message'}...
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge
                    variant="outline"
                    className={`inquiry-type-badge ${inquiry.inquiry_type || 'property'}`}
                  >
                    {(() => {
                      const Icon = getInquiryTypeIcon(inquiry.inquiry_type);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {getInquiryTypeLabel(inquiry.inquiry_type)}
                  </Badge>
                  {inquiry.property && (
                    <span className="inquiry-property">
                      {inquiry.property.title}
                    </span>
                  )}
                </div>
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
        <div className="inquiry-detail admin-section-card">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="inquiry-delete-btn"
                    onClick={() => setDeleteId(selectedInquiry.id)}
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
                        {selectedInquiry.property.area} •{" "}
                        {formatPrice(selectedInquiry.property.price)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Service Details for Home Loan / Interior Design */}
                {selectedInquiry.service_details && Object.keys(selectedInquiry.service_details).length > 0 && (
                  <motion.div
                    className="inquiry-service-details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    <h4>
                      {selectedInquiry.inquiry_type === 'home_loan' 
                        ? 'Home Loan Details' 
                        : selectedInquiry.inquiry_type === 'interior_design' 
                        ? 'Interior Design Details'
                        : 'Vastu Consultation Details'}
                    </h4>
                    <div className="inquiry-service-details-grid">
                      {selectedInquiry.inquiry_type === 'home_loan' ? (
                        <>
                          {selectedInquiry.service_details.employment_type && (
                            <div className="inquiry-service-detail-item">
                              <label>Employment Type</label>
                              <span>{selectedInquiry.service_details.employment_type}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.monthly_income && (
                            <div className="inquiry-service-detail-item">
                              <label>Monthly Income</label>
                              <span>{selectedInquiry.service_details.monthly_income}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.loan_amount && (
                            <div className="inquiry-service-detail-item">
                              <label>Loan Amount</label>
                              <span>{selectedInquiry.service_details.loan_amount}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.property_type && (
                            <div className="inquiry-service-detail-item">
                              <label>Property Type</label>
                              <span>{selectedInquiry.service_details.property_type}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.preferred_banks && (
                            <div className="inquiry-service-detail-item">
                              <label>Preferred Bank</label>
                              <span>{selectedInquiry.service_details.preferred_banks}</span>
                            </div>
                          )}
                        </>
                      ) : selectedInquiry.inquiry_type === 'interior_design' ? (
                        <>
                          {selectedInquiry.service_details.property_type && (
                            <div className="inquiry-service-detail-item">
                              <label>Property Type</label>
                              <span>{selectedInquiry.service_details.property_type}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.property_size && (
                            <div className="inquiry-service-detail-item">
                              <label>Property Size</label>
                              <span>{selectedInquiry.service_details.property_size} sq.ft.</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.design_style && (
                            <div className="inquiry-service-detail-item">
                              <label>Design Style</label>
                              <span>{selectedInquiry.service_details.design_style}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.budget_range && (
                            <div className="inquiry-service-detail-item">
                              <label>Budget Range</label>
                              <span>{selectedInquiry.service_details.budget_range}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.timeline && (
                            <div className="inquiry-service-detail-item">
                              <label>Timeline</label>
                              <span>{selectedInquiry.service_details.timeline}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.rooms_to_design &&
                            selectedInquiry.service_details.rooms_to_design.length > 0 && (
                              <div
                                className="inquiry-service-detail-item"
                                style={{ gridColumn: "1 / -1" }}
                              >
                                <label>Rooms to Design</label>
                                <div className="inquiry-rooms-list">
                                  {selectedInquiry.service_details.rooms_to_design.map(
                                    (room) => (
                                      <span key={room} className="inquiry-room-tag">
                                        {room}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </>
                      ) : (
                        <>
                          {selectedInquiry.service_details.property_type && (
                            <div className="inquiry-service-detail-item">
                              <label>Property Type</label>
                              <span>{selectedInquiry.service_details.property_type}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.consultation_type && (
                            <div className="inquiry-service-detail-item">
                              <label>Consultation Type</label>
                              <span>{selectedInquiry.service_details.consultation_type}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.preferred_date && (
                            <div className="inquiry-service-detail-item">
                              <label>Preferred Date</label>
                              <span>{selectedInquiry.service_details.preferred_date}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.property_address && (
                            <div
                              className="inquiry-service-detail-item"
                              style={{ gridColumn: "1 / -1" }}
                            >
                              <label>Property Address</label>
                              <span>{selectedInquiry.service_details.property_address}</span>
                            </div>
                          )}
                          {selectedInquiry.service_details.issues &&
                            selectedInquiry.service_details.issues.length > 0 && (
                              <div
                                className="inquiry-service-detail-item"
                                style={{ gridColumn: "1 / -1" }}
                              >
                                <label>Areas of Concern</label>
                                <div className="inquiry-rooms-list">
                                  {selectedInquiry.service_details.issues.map((issue) => (
                                    <span key={issue} className="inquiry-room-tag">
                                      {issue}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                        </>
                      )}
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
                  <div className="message-content">
                    {(selectedInquiry.message || 'No message provided').split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
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
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-admin-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="btn-admin-danger"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
