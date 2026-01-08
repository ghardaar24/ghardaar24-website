"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "@/lib/motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  User,
  Mail,
  Lock,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  MessageSquare,
  Landmark,
  Palette,
  Building,
} from "lucide-react";

interface Staff {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface Sheet {
  id: string;
  name: string;
}

interface SheetAccess {
  id: string;
  staff_id: string;
  sheet_id: string;
}

interface InquiryAccess {
  id: string;
  staff_id: string;
  inquiry_type: 'property' | 'home_loan' | 'interior_design';
}

export default function StaffManagementPage() {
  const { user, session, loading: authLoading } = useAdminAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [sheetAccess, setSheetAccess] = useState<SheetAccess[]>([]);
  const [inquiryAccess, setInquiryAccess] = useState<InquiryAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessTab, setAccessTab] = useState<'sheets' | 'inquiries'>('sheets');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch staff and sheets
  useEffect(() => {
    async function fetchData() {
      try {
        const [staffRes, sheetsRes, accessRes, inquiryAccessRes] = await Promise.all([
          supabase.from("crm_staff").select("*").order("created_at", { ascending: false }),
          supabase.from("crm_sheets").select("*").order("name"),
          supabase.from("crm_sheet_access").select("*"),
          supabase.from("crm_inquiry_access").select("*"),
        ]);

        if (staffRes.error) console.error("Error fetching staff:", staffRes.error);
        if (sheetsRes.error) console.error("Error fetching sheets:", sheetsRes.error);
        if (accessRes.error) console.error("Error fetching access:", accessRes.error);
        if (inquiryAccessRes.error) console.error("Error fetching inquiry access:", inquiryAccessRes.error);

        setStaff(staffRes.data || []);
        setSheets(sheetsRes.data || []);
        setSheetAccess(accessRes.data || []);
        setInquiryAccess(inquiryAccessRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({ email: "", password: "", name: "" });
    setFormError("");
    setEditingStaff(null);
  };

  // Add new staff via API (auto-confirms email)
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      // Call API to create staff (handles both new and existing users)
      const response = await fetch("/api/create-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password || undefined, // Optional for existing users
          name: formData.name,
          adminId: user?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || "Failed to create staff member.");
        setSaving(false);
        return;
      }

      setStaff(prev => [result.staff, ...prev]);
      setShowAddModal(false);
      resetForm();
      
      // Show different alert based on whether user was existing or new
      if (result.isExistingUser) {
        alert("Staff member added successfully! They can use their existing login credentials.");
      }
    } catch (error: any) {
      console.error("Error adding staff:", error);
      setFormError(error.message || "Failed to add staff member.");
    } finally {
      setSaving(false);
    }
  };

  // Update staff via API (syncs to Supabase Auth)
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setFormError("");
    setSaving(true);

    try {
      const response = await fetch("/api/update-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          staffId: editingStaff.id,
          name: formData.name,
          password: formData.password || undefined, // Only send if provided
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || "Failed to update staff member.");
        setSaving(false);
        return;
      }

      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, name: formData.name } : s));
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      setFormError(error.message || "Failed to update staff member.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle staff active status
  const toggleStaffActive = async (staffMember: Staff) => {
    try {
      const { error } = await supabase
        .from("crm_staff")
        .update({ is_active: !staffMember.is_active })
        .eq("id", staffMember.id);

      if (error) throw error;

      setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, is_active: !s.is_active } : s));
    } catch (error) {
      console.error("Error toggling staff status:", error);
      alert("Failed to update staff status.");
    }
  };

  // Delete staff via API (removes from Supabase Auth)
  const handleDeleteStaff = async (staffId: string) => {
    try {
      const response = await fetch("/api/delete-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ staffId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete staff member.");
      }

      setStaff(prev => prev.filter(s => s.id !== staffId));
      setSheetAccess(prev => prev.filter(a => a.staff_id !== staffId));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      alert(error.message || "Failed to delete staff member.");
    }
  };

  // Toggle sheet access
  const toggleSheetAccess = async (staffId: string, sheetId: string) => {
    const existing = sheetAccess.find(a => a.staff_id === staffId && a.sheet_id === sheetId);

    try {
      if (existing) {
        // Remove access
        const { error } = await supabase.from("crm_sheet_access").delete().eq("id", existing.id);
        if (error) throw error;

        setSheetAccess(prev => prev.filter(a => a.id !== existing.id));
      } else {
        // Grant access
        const { data, error } = await supabase
          .from("crm_sheet_access")
          .insert([{ staff_id: staffId, sheet_id: sheetId, granted_by: user?.id }])
          .select()
          .single();

        if (error) throw error;

        setSheetAccess(prev => [...prev, data]);
      }
    } catch (error) {
      console.error("Error toggling access:", error);
      alert("Failed to update sheet access.");
    }
  };

  // Get accessible sheets for a staff member
  const getStaffSheets = (staffId: string) => {
    const accessIds = sheetAccess.filter(a => a.staff_id === staffId).map(a => a.sheet_id);
    return sheets.filter(s => accessIds.includes(s.id));
  };

  // Get accessible inquiry types for a staff member
  const getStaffInquiryTypes = (staffId: string) => {
    return inquiryAccess.filter(a => a.staff_id === staffId).map(a => a.inquiry_type);
  };

  // Toggle inquiry type access
  const toggleInquiryAccess = async (staffId: string, inquiryType: 'property' | 'home_loan' | 'interior_design') => {
    const existing = inquiryAccess.find(a => a.staff_id === staffId && a.inquiry_type === inquiryType);

    try {
      if (existing) {
        // Remove access
        const { error } = await supabase.from("crm_inquiry_access").delete().eq("id", existing.id);
        if (error) throw error;

        setInquiryAccess(prev => prev.filter(a => a.id !== existing.id));
      } else {
        // Grant access
        const { data, error } = await supabase
          .from("crm_inquiry_access")
          .insert([{ staff_id: staffId, inquiry_type: inquiryType, granted_by: user?.id }])
          .select()
          .single();

        if (error) throw error;

        setInquiryAccess(prev => [...prev, data]);
      }
    } catch (error) {
      console.error("Error toggling inquiry access:", error);
      alert("Failed to update inquiry access.");
    }
  };

  // Get inquiry type label
  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case 'home_loan': return 'Home Loan';
      case 'interior_design': return 'Interior Design';
      default: return 'Property';
    }
  };

  // Get inquiry type icon
  const getInquiryTypeIcon = (type: string) => {
    switch (type) {
      case 'home_loan': return Landmark;
      case 'interior_design': return Palette;
      default: return Building;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="admin-page">
        <motion.div className="admin-loading-inline" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/admin"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: '#f3f4f6' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1>Staff Management</h1>
            <p>Manage staff members and their CRM sheet access</p>
          </div>
        </div>
        <motion.button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-admin-primary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </motion.button>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Shield className="w-5 h-5" style={{ color: '#6366f1' }} />
        <p style={{ fontSize: '0.875rem', color: '#4338ca' }}>
          Staff members can only view sheets you grant them access to. They can login at <strong>/staff/login</strong>
        </p>
      </motion.div>

      {/* Staff List */}
      {staff.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <User className="w-12 h-12 mx-auto mb-4" style={{ color: '#9ca3af' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            No Staff Members Yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Add staff members to give them read-only access to specific CRM sheets.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-admin-primary"
          >
            <Plus className="w-4 h-4" />
            Add First Staff Member
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                  Name
                </th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                  Email
                </th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                  CRM Sheets
                </th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                  Inquiries
                </th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s, index) => {
                const accessibleSheets = getStaffSheets(s.id);
                const accessibleInquiryTypes = getStaffInquiryTypes(s.id);
                return (
                  <tr key={s.id} style={{ borderBottom: index < staff.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#111827' }}>{s.name}</td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>{s.email}</td>
                    <td style={{ padding: '1rem' }}>
                      {accessibleSheets.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {accessibleSheets.slice(0, 2).map(sheet => (
                            <span
                              key={sheet.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                background: '#eef2ff',
                                color: '#4338ca',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                              {sheet.name}
                            </span>
                          ))}
                          {accessibleSheets.length > 2 && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              +{accessibleSheets.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {accessibleInquiryTypes.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {accessibleInquiryTypes.map(type => {
                            const Icon = getInquiryTypeIcon(type);
                            return (
                              <span
                                key={type}
                                className={`inquiry-type-badge ${type}`}
                              >
                                <Icon className="w-3 h-3" />
                                {getInquiryTypeLabel(type)}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => toggleStaffActive(s)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          border: 'none',
                          cursor: 'pointer',
                          background: s.is_active ? '#dcfce7' : '#fee2e2',
                          color: s.is_active ? '#166534' : '#991b1b',
                        }}
                      >
                        {s.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setSelectedStaff(s);
                            setShowAccessModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem',
                            background: '#eef2ff',
                            color: '#4338ca',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Access
                        </button>
                        <button
                          onClick={() => {
                            setEditingStaff(s);
                            setFormData({ email: s.email, password: '', name: s.name });
                            setShowAddModal(true);
                          }}
                          style={{
                            padding: '0.375rem',
                            background: '#f3f4f6',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 className="w-4 h-4" style={{ color: '#6b7280' }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          style={{
                            padding: '0.375rem',
                            background: '#fef2f2',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Add/Edit Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <motion.div
              className="modal-content crm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '24rem' }}
            >
              <div className="modal-header">
                <h2>{editingStaff ? "Edit Staff" : "Add New Staff"}</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff} style={{ padding: '1.5rem' }}>
                {formError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: '#fef2f2',
                    color: '#991b1b',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}>
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="John Doe"
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '0.75rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    />
                    <User className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 10, pointerEvents: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={!!editingStaff}
                      placeholder="staff@example.com"
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '0.75rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        opacity: editingStaff ? 0.6 : 1,
                      }}
                    />
                    <Mail className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 10, pointerEvents: 'none' }} />
                  </div>
                </div>

                {!editingStaff && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                      Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional for existing users)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        minLength={6}
                        placeholder="Required for new users only"
                        style={{
                          width: '100%',
                          paddingLeft: '2.5rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.625rem',
                          paddingBottom: '0.625rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                      />
                      <Lock className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 10, pointerEvents: 'none' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.375rem' }}>
                      Leave blank if the user already has an account - they&apos;ll use their existing password.
                    </p>
                  </div>
                )}

                {editingStaff && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                      New Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        minLength={6}
                        placeholder="Leave blank to keep current password"
                        style={{
                          width: '100%',
                          paddingLeft: '2.5rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.625rem',
                          paddingBottom: '0.625rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                      />
                      <Lock className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 10, pointerEvents: 'none' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.375rem' }}>
                      Enter a new password to reset the staff member&apos;s password
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="btn-admin-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-admin-primary"
                    style={{ flex: 1 }}
                  >
                    {saving ? "Saving..." : editingStaff ? "Save Changes" : "Add Staff"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Modal - Sheets & Inquiries */}
      <AnimatePresence>
        {showAccessModal && selectedStaff && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAccessModal(false);
              setSelectedStaff(null);
              setAccessTab('sheets');
            }}
          >
            <motion.div
              className="modal-content crm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '32rem' }}
            >
              <div className="modal-header">
                <h2>Access for {selectedStaff.name}</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowAccessModal(false);
                    setSelectedStaff(null);
                    setAccessTab('sheets');
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => setAccessTab('sheets')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: accessTab === 'sheets' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      background: accessTab === 'sheets' ? '#eef2ff' : 'white',
                      color: accessTab === 'sheets' ? '#4338ca' : '#6b7280',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    CRM Sheets
                  </button>
                  <button
                    onClick={() => setAccessTab('inquiries')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: accessTab === 'inquiries' ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                      background: accessTab === 'inquiries' ? 'rgba(243, 106, 42, 0.1)' : 'white',
                      color: accessTab === 'inquiries' ? 'var(--primary)' : '#6b7280',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inquiries
                  </button>
                </div>

                {/* Sheets Tab Content */}
                {accessTab === 'sheets' && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                      Select which CRM sheets this staff member can view.
                    </p>

                    {sheets.length === 0 ? (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        background: '#f9fafb',
                        borderRadius: '0.75rem',
                      }}>
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2" style={{ color: '#9ca3af' }} />
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          No sheets available. Import data to create sheets first.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sheets.map(sheet => {
                          const hasAccess = sheetAccess.some(
                            a => a.staff_id === selectedStaff.id && a.sheet_id === sheet.id
                          );
                          return (
                            <button
                              key={sheet.id}
                              onClick={() => toggleSheetAccess(selectedStaff.id, sheet.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.875rem 1rem',
                                background: hasAccess ? '#eef2ff' : '#f9fafb',
                                border: hasAccess ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FileSpreadsheet className="w-5 h-5" style={{ color: hasAccess ? '#4338ca' : '#6b7280' }} />
                                <span style={{ fontWeight: 500, color: hasAccess ? '#4338ca' : '#374151' }}>
                                  {sheet.name}
                                </span>
                              </div>
                              {hasAccess && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '1.25rem',
                                  height: '1.25rem',
                                  background: '#6366f1',
                                  borderRadius: '9999px',
                                }}>
                                  <Check className="w-3 h-3" style={{ color: 'white' }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Inquiries Tab Content */}
                {accessTab === 'inquiries' && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                      Select which inquiry types this staff member can view.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(['property', 'home_loan', 'interior_design'] as const).map(type => {
                        const hasAccess = inquiryAccess.some(
                          a => a.staff_id === selectedStaff.id && a.inquiry_type === type
                        );
                        const Icon = getInquiryTypeIcon(type);
                        const colorMap = {
                          property: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
                          home_loan: { bg: '#dcfce7', border: '#22c55e', text: '#16a34a' },
                          interior_design: { bg: '#f3e8ff', border: '#a855f7', text: '#9333ea' },
                        };
                        const colors = colorMap[type];

                        return (
                          <button
                            key={type}
                            onClick={() => toggleInquiryAccess(selectedStaff.id, type)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.875rem 1rem',
                              background: hasAccess ? colors.bg : '#f9fafb',
                              border: hasAccess ? `2px solid ${colors.border}` : '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Icon className="w-5 h-5" style={{ color: hasAccess ? colors.text : '#6b7280' }} />
                              <span style={{ fontWeight: 500, color: hasAccess ? colors.text : '#374151' }}>
                                {getInquiryTypeLabel(type)} Inquiries
                              </span>
                            </div>
                            {hasAccess && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '1.25rem',
                                height: '1.25rem',
                                background: colors.border,
                                borderRadius: '9999px',
                              }}>
                                <Check className="w-3 h-3" style={{ color: 'white' }} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <button
                  onClick={() => {
                    setShowAccessModal(false);
                    setSelectedStaff(null);
                    setAccessTab('sheets');
                  }}
                  className="btn-admin-secondary"
                  style={{ width: '100%', marginTop: '1.5rem' }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="modal-content crm-modal crm-delete-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="crm-delete-content">
                <Trash2 className="w-12 h-12" />
                <h3>Delete Staff Member?</h3>
                <p>This will remove all their sheet access. This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="btn-admin-secondary" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </button>
                  <button className="btn-admin-danger" onClick={() => handleDeleteStaff(deleteConfirm)}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
