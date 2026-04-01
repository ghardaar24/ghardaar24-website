"use client";

import { useEffect, useState, useRef } from "react";
import { useStaffAuth, supabaseStaff } from "@/lib/staff-auth";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  MapPin,
  Camera,
  Calendar,
  FileText,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Loader2,
  Image as ImageIcon,
  User,
  Phone,
  History,
  ChevronDown,
} from "lucide-react";

interface PropertyOption {
  id: string;
  title: string;
  city: string;
  area: string;
}

interface ClientOption {
  id: string;
  client_name: string;
  customer_number: string;
}

interface SiteVisit {
  id: string;
  property_title: string;
  location: string;
  visit_date: string;
  visit_time: string | null;
  notes: string | null;
  photo_url: string;
  created_at: string;
  client_name: string | null;
  client_mobile: string | null;
}

interface ClientVisitHistory {
  property_title: string;
  location: string;
  visit_date: string;
  staff_name?: string;
}

export default function StaffSiteVisitsPage() {
  const { staffProfile } = useStaffAuth();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [location, setLocation] = useState("");
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [visitTime, setVisitTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientMobile, setClientMobile] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [clientVisitHistory, setClientVisitHistory] = useState<ClientVisitHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clientAutoFilled, setClientAutoFilled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch staff's visits and properties
  useEffect(() => {
    if (!staffProfile) return;
    fetchVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffProfile]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(e.target as Node)) {
        setShowPropertyDropdown(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchVisits = async () => {
    try {
      const [visitsRes, propertiesRes, clientsRes] = await Promise.all([
        supabaseStaff
          .from("site_visits")
          .select("*")
          .eq("staff_id", staffProfile!.id)
          .order("visit_date", { ascending: false }),
        supabaseStaff
          .from("properties")
          .select("id, title, city, area")
          .order("title"),
        supabaseStaff
          .from("crm_clients")
          .select("id, client_name, customer_number")
          .order("client_name"),
      ]);

      if (visitsRes.error) throw visitsRes.error;
      setVisits(visitsRes.data || []);
      setProperties((propertiesRes.data || []) as PropertyOption[]);
      setClients((clientsRes.data || []) as ClientOption[]);
    } catch (err) {
      console.error("Error fetching visits:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Photo must be less than 5MB" });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setPropertyTitle("");
    setPropertySearch("");
    setShowPropertyDropdown(false);
    setLocation("");
    setVisitDate(new Date().toISOString().split("T")[0]);
    setVisitTime("");
    setClientName("");
    setClientSearch("");
    setShowClientDropdown(false);
    setClientMobile("");
    setClientAutoFilled(false);
    setNotes("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setClientVisitHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Lookup client visit history by mobile number and auto-fill client name
  const lookupClientHistory = async (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setClientVisitHistory([]);
      setClientAutoFilled(false);
      return;
    }

    setLoadingHistory(true);
    try {
      const [historyRes, clientRes] = await Promise.all([
        supabaseStaff
          .from("site_visits")
          .select("property_title, location, visit_date, crm_staff(name)")
          .eq("client_mobile", cleaned)
          .order("visit_date", { ascending: false }),
        supabaseStaff
          .from("crm_clients")
          .select("client_name")
          .eq("customer_number", cleaned)
          .limit(1),
      ]);

      if (historyRes.error) throw historyRes.error;

      // Auto-fill client name from CRM if found
      if (clientRes.data && clientRes.data.length > 0 && clientRes.data[0].client_name) {
        setClientName(clientRes.data[0].client_name);
        setClientAutoFilled(true);
      } else {
        setClientAutoFilled(false);
      }

      setClientVisitHistory(
        (historyRes.data || []).map((v: Record<string, unknown>) => ({
          property_title: v.property_title as string,
          location: v.location as string,
          visit_date: v.visit_date as string,
          staff_name: (v.crm_staff as Record<string, string> | null)?.name,
        }))
      );
    } catch (err) {
      console.error("Error looking up client history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMobileChange = (value: string) => {
    // Allow only digits, max 10
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setClientMobile(cleaned);

    if (mobileDebounceRef.current) clearTimeout(mobileDebounceRef.current);
    mobileDebounceRef.current = setTimeout(() => {
      lookupClientHistory(cleaned);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffProfile || !photoFile) return;

    setSubmitting(true);
    setMessage(null);

    try {
      // Upload photo
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${staffProfile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseStaff.storage
        .from("site-visit-photos")
        .upload(fileName, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabaseStaff.storage
        .from("site-visit-photos")
        .getPublicUrl(fileName);

      // Insert visit record
      const { error: insertError } = await supabaseStaff
        .from("site_visits")
        .insert({
          staff_id: staffProfile.id,
          property_title: propertyTitle.trim(),
          location: location.trim(),
          visit_date: visitDate,
          visit_time: visitTime || null,
          client_name: clientName.trim() || null,
          client_mobile: clientMobile || null,
          notes: notes.trim() || null,
          photo_url: publicUrl,
        });

      if (insertError) throw insertError;

      setMessage({ type: "success", text: "Site visit recorded successfully!" });
      resetForm();
      setShowForm(false);
      fetchVisits();
    } catch (err) {
      console.error("Error recording visit:", err);
      setMessage({
        type: "error",
        text: "Failed to record visit. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string, timeStr?: string | null) => {
    const date = new Date(dateStr + "T00:00:00");
    const dateString = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const timeString = timeDate.toLocaleTimeString("en-IN", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${dateString} at ${timeString}`;
    }

    return dateString;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="staff-page-container">
        <div className="staff-loading">
          <div className="staff-loading-spinner"></div>
          <p>Loading site visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-page-container">
      {/* Header */}
      <motion.div
        className="sv-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="sv-header-text">
          <h1>
            <MapPin className="w-6 h-6" />
            Site Visits
          </h1>
          <p>Record your property site visits with photo proof</p>
        </div>
        <motion.button
          className={`sv-add-btn ${showForm ? "active" : ""}`}
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" /> New Visit
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`sv-message ${message.type}`}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
            <button onClick={() => setMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            className="sv-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sv-form-inner">
              <h2>Record New Site Visit</h2>

              <div className="sv-form-grid">
                <div className="sv-form-group" ref={propertyDropdownRef}>
                  <label>
                    <Building className="w-4 h-4" />
                    Property / Project Name *
                  </label>
                  <div className="sv-combobox">
                    <input
                      type="text"
                      value={propertyTitle}
                      onChange={(e) => {
                        setPropertyTitle(e.target.value);
                        setPropertySearch(e.target.value);
                        setShowPropertyDropdown(true);
                      }}
                      onFocus={() => setShowPropertyDropdown(true)}
                      placeholder="Search or type property name..."
                      required
                      autoComplete="off"
                    />
                    <ChevronDown
                      className={`w-4 h-4 sv-combobox-icon ${showPropertyDropdown ? "open" : ""}`}
                      onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                    />
                    {showPropertyDropdown && (
                      <div className="sv-combobox-dropdown">
                        {properties
                          .filter((p) =>
                            !propertySearch ||
                            p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                            p.city.toLowerCase().includes(propertySearch.toLowerCase()) ||
                            p.area?.toLowerCase().includes(propertySearch.toLowerCase())
                          )
                          .map((p) => (
                            <div
                              key={p.id}
                              className={`sv-combobox-option ${propertyTitle === p.title ? "selected" : ""}`}
                              onClick={() => {
                                setPropertyTitle(p.title);
                                setPropertySearch(p.title);
                                setLocation([p.area, p.city].filter(Boolean).join(", "));
                                setShowPropertyDropdown(false);
                              }}
                            >
                              <span className="sv-combobox-option-title">{p.title}</span>
                              <span className="sv-combobox-option-location">
                                <MapPin className="w-3 h-3" />
                                {[p.area, p.city].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          ))}
                        {properties.filter((p) =>
                          !propertySearch ||
                          p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                          p.city.toLowerCase().includes(propertySearch.toLowerCase()) ||
                          p.area?.toLowerCase().includes(propertySearch.toLowerCase())
                        ).length === 0 && (
                          <div className="sv-combobox-empty">
                            No matching properties — custom name will be used
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="sv-form-group">
                  <label>
                    <MapPin className="w-4 h-4" />
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Whitefield, Bangalore"
                    required
                  />
                </div>

                <div className="sv-form-group" ref={clientDropdownRef}>
                  <label>
                    <User className="w-4 h-4" />
                    Client Name
                    {clientAutoFilled && (
                      <span className="sv-auto-filled-badge">
                        <CheckCircle className="w-3 h-3" />
                        Auto-detected
                      </span>
                    )}
                  </label>
                  <div className="sv-combobox">
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setClientSearch(e.target.value);
                        setShowClientDropdown(true);
                        setClientAutoFilled(false);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      placeholder="Search or type client name..."
                      autoComplete="off"
                    />
                    <ChevronDown
                      className={`w-4 h-4 sv-combobox-icon ${showClientDropdown ? "open" : ""}`}
                      onClick={() => setShowClientDropdown(!showClientDropdown)}
                    />
                    {showClientDropdown && (
                      <div className="sv-combobox-dropdown">
                        {clients
                          .filter((c) =>
                            !clientSearch ||
                            c.client_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                            c.customer_number?.includes(clientSearch)
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              className={`sv-combobox-option ${clientName === c.client_name ? "selected" : ""}`}
                              onClick={() => {
                                setClientName(c.client_name);
                                setClientSearch(c.client_name);
                                setClientMobile(c.customer_number || "");
                                setShowClientDropdown(false);
                                setClientAutoFilled(false);
                                if (c.customer_number) {
                                  lookupClientHistory(c.customer_number);
                                }
                              }}
                            >
                              <span className="sv-combobox-option-title">{c.client_name}</span>
                              {c.customer_number && (
                                <span className="sv-combobox-option-location">
                                  <Phone className="w-3 h-3" />
                                  {c.customer_number}
                                </span>
                              )}
                            </div>
                          ))}
                        {clients.filter((c) =>
                          !clientSearch ||
                          c.client_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                          c.customer_number?.includes(clientSearch)
                        ).length === 0 && (
                          <div className="sv-combobox-empty">
                            No matching clients — custom name will be used
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="sv-form-group">
                  <label>
                    <Phone className="w-4 h-4" />
                    Client Phone No.
                  </label>
                  <input
                    type="tel"
                    value={clientMobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="e.g., 9876543210"
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>

                {/* Client Visit History */}
                {loadingHistory && (
                  <div className="sv-form-full sv-client-history-loading">
                    <Loader2 className="w-4 h-4 sv-spin" />
                    <span>Checking visit history...</span>
                  </div>
                )}
                {clientVisitHistory.length > 0 && (
                  <div className="sv-form-group sv-form-full">
                    <div className="sv-client-history">
                      <div className="sv-client-history-header">
                        <History className="w-4 h-4" />
                        <span>
                          This client has visited{" "}
                          <strong>{clientVisitHistory.length}</strong> project
                          {clientVisitHistory.length > 1 ? "s" : ""} before
                        </span>
                      </div>
                      <div className="sv-client-history-list">
                        {clientVisitHistory.map((h, i) => (
                          <div key={i} className="sv-client-history-item">
                            <div className="sv-client-history-project">
                              <Building className="w-3.5 h-3.5" />
                              {h.property_title}
                            </div>
                            <div className="sv-client-history-details">
                              <span>
                                <MapPin className="w-3 h-3" />
                                {h.location}
                              </span>
                              <span>
                                <Calendar className="w-3 h-3" />
                                {new Date(h.visit_date + "T00:00:00").toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              {h.staff_name && (
                                <span>
                                  <User className="w-3 h-3" />
                                  {h.staff_name}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="sv-form-group">
                    <label>
                      <Calendar className="w-4 h-4" />
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="sv-form-group">
                    <label>
                      <Clock className="w-4 h-4" />
                      Visit Time
                    </label>
                    <input
                      type="time"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sv-form-group sv-form-full">
                  <label>
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any observations, client feedback, property condition..."
                    rows={3}
                  />
                </div>

                <div className="sv-form-group sv-form-full">
                  <label>
                    <Camera className="w-4 h-4" />
                    Photo Proof *
                  </label>
                  <div
                    className={`sv-photo-upload ${photoPreview ? "has-preview" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <div className="sv-photo-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoPreview} alt="Preview" />
                        <div className="sv-photo-overlay">
                          <Camera className="w-6 h-6" />
                          <span>Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="sv-photo-placeholder">
                        <ImageIcon className="w-10 h-10" />
                        <span>Click to upload photo</span>
                        <span className="sv-photo-hint">
                          JPG, PNG up to 5MB
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                      required={!photoPreview}
                    />
                  </div>
                </div>
              </div>

              <div className="sv-form-actions">
                <button
                  type="button"
                  className="sv-btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sv-btn-primary"
                  disabled={submitting || !photoFile}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sv-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Record Visit
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        className="sv-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="sv-stat-card">
          <span className="sv-stat-value">{visits.length}</span>
          <span className="sv-stat-label">Total Visits</span>
        </div>
        <div className="sv-stat-card">
          <span className="sv-stat-value">
            {
              visits.filter((v) => {
                const vDate = new Date(v.visit_date + "T00:00:00");
                const now = new Date();
                return (
                  vDate.getMonth() === now.getMonth() &&
                  vDate.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </span>
          <span className="sv-stat-label">This Month</span>
        </div>
        <div className="sv-stat-card">
          <span className="sv-stat-value">
            {
              visits.filter((v) => {
                const vDate = new Date(v.visit_date + "T00:00:00");
                const now = new Date();
                const weekAgo = new Date(
                  now.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                return vDate >= weekAgo;
              }).length
            }
          </span>
          <span className="sv-stat-label">This Week</span>
        </div>
      </motion.div>

      {/* Visits List */}
      <div className="sv-visits-list">
        {visits.length === 0 ? (
          <motion.div
            className="sv-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapPin className="w-12 h-12" />
            <h3>No site visits recorded yet</h3>
            <p>
              Click &quot;New Visit&quot; to record your first site visit with
              photo proof.
            </p>
          </motion.div>
        ) : (
          visits.map((visit, index) => (
            <motion.div
              key={visit.id}
              className="sv-visit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <div
                className="sv-visit-photo"
                onClick={() => setExpandedPhoto(visit.photo_url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={visit.photo_url} alt={visit.property_title} />
                <div className="sv-visit-photo-zoom">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="sv-visit-info">
                <h3>{visit.property_title}</h3>
                {(visit.client_name || visit.client_mobile) && (
                  <div className="sv-visit-client">
                    {visit.client_name && (
                      <span>
                        <User className="w-3.5 h-3.5" />
                        {visit.client_name}
                      </span>
                    )}
                    {visit.client_mobile && (
                      <span>
                        <Phone className="w-3.5 h-3.5" />
                        {visit.client_mobile}
                      </span>
                    )}
                  </div>
                )}
                <div className="sv-visit-meta">
                  <span>
                    <MapPin className="w-3.5 h-3.5" />
                    {visit.location}
                  </span>
                  <span>
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(visit.visit_date, visit.visit_time)}
                  </span>
                  <span className="sv-visit-ago">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimeAgo(visit.created_at)}
                  </span>
                </div>
                {visit.notes && (
                  <p className="sv-visit-notes">{visit.notes}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {expandedPhoto && (
          <motion.div
            className="sv-photo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedPhoto(null)}
          >
            <motion.div
              className="sv-photo-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="sv-photo-modal-close"
                onClick={() => setExpandedPhoto(null)}
              >
                <X className="w-6 h-6" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={expandedPhoto} alt="Site visit photo" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
