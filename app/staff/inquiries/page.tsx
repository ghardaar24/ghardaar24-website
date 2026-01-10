"use client";

import { useEffect, useState } from "react";
import { useStaffAuth, supabaseStaff } from "@/lib/staff-auth";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Calendar,
  Building,
  Landmark,
  Palette,
  ChevronRight,
  ExternalLink,
  Compass,
} from "lucide-react";
import Link from "next/link";

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

export default function StaffInquiriesPage() {
  const { staffProfile, accessibleInquiryTypes, loading: authLoading } = useStaffAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'property' | 'home_loan' | 'interior_design' | 'vastu_consultation'>('all');

  useEffect(() => {
    if (!authLoading && staffProfile && accessibleInquiryTypes.length > 0) {
      fetchInquiries();
    } else if (!authLoading && accessibleInquiryTypes.length === 0) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, staffProfile, accessibleInquiryTypes]);

  async function fetchInquiries() {
    try {
      const accessibleTypes = accessibleInquiryTypes.map(a => a.inquiry_type);
      
      const { data, error } = await supabaseStaff
        .from("inquiries")
        .select(`
          *,
          property:properties(title, area, price)
        `)
        .in("inquiry_type", accessibleTypes)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
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

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const accessibleTypeNames = accessibleInquiryTypes.map(a => a.inquiry_type);

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

  if (authLoading || loading) {
    return (
      <div className="staff-page">
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

  // No access message
  if (accessibleInquiryTypes.length === 0) {
    return (
      <div className="staff-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            No Inquiry Access
          </h3>
          <p style={{ color: '#6b7280' }}>
            You don&apos;t have access to any inquiry categories yet. Please contact your administrator.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="staff-page">
      {/* Header */}
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>Inquiries</h1>
          <p>View customer inquiries assigned to you</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
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

      {/* Filter Tabs - Only show accessible types */}
      <motion.div
        className="admin-filter-tabs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <motion.button
          className={`admin-filter-tab ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTypeFilter('all')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          All ({inquiries.length})
        </motion.button>
        {accessibleTypeNames.includes('property') && (
          <motion.button
            className={`admin-filter-tab ${typeFilter === 'property' ? 'active' : ''}`}
            onClick={() => setTypeFilter('property')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Property ({inquiries.filter(i => (i.inquiry_type || 'property') === 'property').length})
          </motion.button>
        )}
        {accessibleTypeNames.includes('home_loan') && (
          <motion.button
            className={`admin-filter-tab ${typeFilter === 'home_loan' ? 'active' : ''}`}
            onClick={() => setTypeFilter('home_loan')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Home Loan ({inquiries.filter(i => i.inquiry_type === 'home_loan').length})
          </motion.button>
        )}
        {accessibleTypeNames.includes('interior_design') && (
          <motion.button
            className={`admin-filter-tab ${typeFilter === 'interior_design' ? 'active' : ''}`}
            onClick={() => setTypeFilter('interior_design')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Interior Design ({inquiries.filter(i => i.inquiry_type === 'interior_design').length})
          </motion.button>
        )}
        {accessibleTypeNames.includes('vastu_consultation') && (
          <motion.button
            className={`admin-filter-tab ${typeFilter === 'vastu_consultation' ? 'active' : ''}`}
            onClick={() => setTypeFilter('vastu_consultation')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Vastu Consultation ({inquiries.filter(i => i.inquiry_type === 'vastu_consultation').length})
          </motion.button>
        )}
      </motion.div>

      {/* Inquiries Layout */}
      <motion.div
        className="inquiries-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Inquiries List */}
        <div className="inquiries-list admin-section-card">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry, index) => {
              const Icon = getInquiryTypeIcon(inquiry.inquiry_type);
              return (
                <motion.div
                  key={inquiry.id}
                  className={`inquiry-card ${selectedInquiry?.id === inquiry.id ? "active" : ""}`}
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
                    <span className={`inquiry-type-badge ${inquiry.inquiry_type || 'property'}`}>
                      <Icon className="w-3 h-3" />
                      {getInquiryTypeLabel(inquiry.inquiry_type)}
                    </span>
                    {inquiry.property && (
                      <span className="inquiry-property">
                        {inquiry.property.title}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              className="empty-state-admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquare className="w-12 h-12 text-gray-300" />
              <p>No inquiries found</p>
            </motion.div>
          )}
        </div>

        {/* Inquiry Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedInquiry ? (
            <motion.div
              key={selectedInquiry.id}
              className="inquiry-detail admin-section-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="inquiry-detail-header">
                <div>
                  <h2>{selectedInquiry.name}</h2>
                  <span className={`inquiry-type-badge ${selectedInquiry.inquiry_type || 'property'}`}>
                    {getInquiryTypeLabel(selectedInquiry.inquiry_type)}
                  </span>
                </div>
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
                      <ExternalLink className="w-3 h-3" style={{ marginLeft: '0.25rem' }} />
                    </Link>
                    <span className="property-meta">
                      {selectedInquiry.property.area} •{" "}
                      {formatPrice(selectedInquiry.property.price)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Service Details */}
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
                        {selectedInquiry.service_details.rooms_to_design && selectedInquiry.service_details.rooms_to_design.length > 0 && (
                          <div className="inquiry-service-detail-item" style={{ gridColumn: '1 / -1' }}>
                            <label>Rooms to Design</label>
                            <div className="inquiry-rooms-list">
                              {selectedInquiry.service_details.rooms_to_design.map((room) => (
                                <span key={room} className="inquiry-room-tag">{room}</span>
                              ))}
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
                          <div className="inquiry-service-detail-item" style={{ gridColumn: '1 / -1' }}>
                            <label>Property Address</label>
                            <span>{selectedInquiry.service_details.property_address}</span>
                          </div>
                        )}
                         {selectedInquiry.service_details.issues && selectedInquiry.service_details.issues.length > 0 && (
                          <div className="inquiry-service-detail-item" style={{ gridColumn: '1 / -1' }}>
                            <label>Areas of Concern</label>
                            <div className="inquiry-rooms-list">
                              {selectedInquiry.service_details.issues.map((issue) => (
                                <span key={issue} className="inquiry-room-tag">{issue}</span>
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

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="btn-admin-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
                <a
                  href={`https://wa.me/${selectedInquiry.phone?.replace(/\D/g, '')}?text=Hi ${selectedInquiry.name}, regarding your inquiry on Ghardaar24...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-admin-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  WhatsApp
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="inquiry-detail admin-section-card empty-state-admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquare className="w-16 h-16" />
              <h3>Select an inquiry</h3>
              <p>Click on any inquiry from the list to view details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
