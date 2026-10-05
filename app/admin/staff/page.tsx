"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
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
  Loader2,
  CheckCircle,
  Compass,
  CreditCard,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

interface Staff {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  can_manage_properties: boolean;
  can_generate_invoices: boolean;
  can_add_sheets: boolean;
  created_at: string;
  employee_code?: string;
  designation?: string;
  id_card_issued_at?: string;
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
  inquiry_type: 'property' | 'home_loan' | 'interior_design' | 'vastu_consultation';
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
  const [accessTab, setAccessTab] = useState<'sheets' | 'inquiries' | 'permissions'>('sheets');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [idCardStaff, setIdCardStaff] = useState<Staff | null>(null);
  const [idCardForm, setIdCardForm] = useState({ employee_code: "", designation: "" });
  const [generatingIdCard, setGeneratingIdCard] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Email lookup state
  const [lookingUpEmail, setLookingUpEmail] = useState(false);
  const [emailLookupResult, setEmailLookupResult] = useState<{
    exists: boolean;
    name: string | null;
    isStaff: boolean;
    isAdmin: boolean;
  } | null>(null);

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

        if (process.env.NODE_ENV === "development") {
          if (staffRes.error) console.error("Error fetching staff:", staffRes.error);
          if (sheetsRes.error) console.error("Error fetching sheets:", sheetsRes.error);
          if (accessRes.error) console.error("Error fetching access:", accessRes.error);
          if (inquiryAccessRes.error) console.error("Error fetching inquiry access:", inquiryAccessRes.error);
        }

        setStaff(staffRes.data || []);
        setSheets(sheetsRes.data || []);
        setSheetAccess(accessRes.data || []);
        setInquiryAccess(inquiryAccessRes.data || []);
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error fetching data:", error);
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
    setEmailLookupResult(null);
  };

  // Look up user by email to auto-fetch name
  const handleEmailLookup = async (email: string) => {
    if (!email || !email.includes("@") || editingStaff) return;
    
    setLookingUpEmail(true);
    setEmailLookupResult(null);
    setFormError("");
    
    try {
      const response = await fetch("/api/lookup-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (process.env.NODE_ENV === "development") console.error("Email lookup failed:", result.error);
        return;
      }

      setEmailLookupResult(result);
      
      if (result.exists && result.name) {
        // Auto-fill the name field with the existing user's name
        setFormData(prev => ({ ...prev, name: result.name }));
      }
      
      if (result.isStaff) {
        setFormError("This user is already a staff member.");
      } else if (result.isAdmin) {
        setFormError("This user is an admin and cannot be added as staff.");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error looking up email:", error);
    } finally {
      setLookingUpEmail(false);
    }
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
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error adding staff:", error);
      setFormError(error instanceof Error ? error.message : "Failed to add staff member.");
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
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to update staff member.");
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
      if (process.env.NODE_ENV === "development") console.error("Error toggling staff status:", error);
      alert("Failed to update staff status.");
    }
  };

  // Toggle staff permissions
  const toggleStaffPermission = async (staffId: string, permissionStr: 'can_manage_properties' | 'can_generate_invoices' | 'can_add_sheets', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("crm_staff")
        .update({ [permissionStr]: !currentValue })
        .eq("id", staffId);

      if (error) throw error;

      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, [permissionStr]: !currentValue } : s));
      setSelectedStaff(prev => prev && prev.id === staffId ? { ...prev, [permissionStr]: !currentValue } : prev);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error toggling staff permission:", error);
      alert(`Failed to update ${permissionStr}.`);
    }
  };

  // Generate (or regenerate) a staff member's ID card
  const handleGenerateIdCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardStaff) return;
    setGeneratingIdCard(true);

    try {
      const payload = {
        employee_code: idCardForm.employee_code.trim() || undefined,
        designation: idCardForm.designation.trim() || undefined,
        id_card_issued_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("crm_staff")
        .update(payload)
        .eq("id", idCardStaff.id);

      if (error) throw error;

      setStaff(prev => prev.map(s => s.id === idCardStaff.id ? { ...s, ...payload } : s));
      setIdCardStaff(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error generating ID card:", error);
      alert("Failed to generate ID card.");
    } finally {
      setGeneratingIdCard(false);
    }
  };

  // Remove a staff member's ID card
  const handleRemoveIdCard = async () => {
    if (!idCardStaff) return;
    if (!window.confirm("Remove this ID card? This cannot be undone.")) return;
    setGeneratingIdCard(true);

    try {
      const { error } = await supabase
        .from("crm_staff")
        .update({ employee_code: null, designation: null, id_card_issued_at: null })
        .eq("id", idCardStaff.id);

      if (error) throw error;

      const cleared = { employee_code: undefined, designation: undefined, id_card_issued_at: undefined };
      setStaff(prev => prev.map(s => s.id === idCardStaff.id ? { ...s, ...cleared } : s));
      setIdCardStaff(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error removing ID card:", error);
      alert("Failed to remove ID card.");
    } finally {
      setGeneratingIdCard(false);
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
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error deleting staff:", error);
      alert(error instanceof Error ? error.message : "Failed to delete staff member.");
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
      if (process.env.NODE_ENV === "development") console.error("Error toggling access:", error);
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
  const toggleInquiryAccess = async (staffId: string, inquiryType: 'property' | 'home_loan' | 'interior_design' | 'vastu_consultation') => {
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
      if (process.env.NODE_ENV === "development") console.error("Error toggling inquiry access:", error);
      alert("Failed to update inquiry access.");
    }
  };

  // Get inquiry type label
  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case 'home_loan': return 'Home Loan';
      case 'interior_design': return 'Interior Design';
      case 'vastu_consultation': return 'Vastu Consultation';
      default: return 'Property';
    }
  };

  // Get inquiry type icon
  const getInquiryTypeIcon = (type: string) => {
    switch (type) {
      case 'home_loan': return Landmark;
      case 'interior_design': return Palette;
      case 'vastu_consultation': return Compass;
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
      <PageHeader
        eyebrow="People"
        title="Staff"
        description="Staff members and their CRM sheet access."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="btn-admin-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff</span>
              </Button>
            </motion.div>
          </>
        }
      />

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, var(--color-indigo-50) 0%, var(--color-indigo-100) 100%)',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Shield className="w-5 h-5" style={{ color: 'var(--color-indigo-500)' }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--color-indigo-700)' }}>
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
            border: '1px solid var(--color-gray-200)',
          }}
        >
          <User className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-gray-400)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '0.5rem' }}>
            No Staff Members Yet
          </h3>
          <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>
            Add staff members to give them read-only access to specific CRM sheets.
          </p>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-admin-primary"
          >
            <Plus className="w-4 h-4" />
            Add First Staff Member
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid var(--color-gray-200)',
            overflow: 'hidden',
          }}
        >
          <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHeader style={{ background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)' }}>
              <TableRow>
                <TableHead style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Name
                </TableHead>
                <TableHead style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Email
                </TableHead>
                <TableHead style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  CRM Sheets
                </TableHead>
                <TableHead style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Inquiries
                </TableHead>
                <TableHead style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Status
                </TableHead>
                <TableHead style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s, index) => {
                const accessibleSheets = getStaffSheets(s.id);
                const accessibleInquiryTypes = getStaffInquiryTypes(s.id);
                return (
                  <TableRow key={s.id} style={{ borderBottom: index < staff.length - 1 ? '1px solid var(--color-gray-100)' : 'none' }}>
                    <TableCell style={{ padding: '1rem', fontWeight: 500, color: 'var(--color-gray-900)' }}>{s.name}</TableCell>
                    <TableCell style={{ padding: '1rem', color: 'var(--color-gray-500)' }}>{s.email}</TableCell>
                    <TableCell style={{ padding: '1rem' }}>
                      {accessibleSheets.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {accessibleSheets.slice(0, 2).map(sheet => (
                            <Badge
                              key={sheet.id}
                              variant="outline"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                background: 'var(--color-indigo-50)',
                                color: 'var(--color-indigo-700)',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                border: 'none',
                                height: 'auto',
                              }}
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                              {sheet.name}
                            </Badge>
                          ))}
                          {accessibleSheets.length > 2 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                              +{accessibleSheets.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>None</span>
                      )}
                    </TableCell>
                    <TableCell style={{ padding: '1rem' }}>
                      {accessibleInquiryTypes.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {accessibleInquiryTypes.map(type => {
                            const Icon = getInquiryTypeIcon(type);
                            return (
                              <Badge
                                key={type}
                                variant="outline"
                                className={`inquiry-type-badge ${type}`}
                              >
                                <Icon className="w-3 h-3" />
                                {getInquiryTypeLabel(type)}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>None</span>
                      )}
                    </TableCell>
                    <TableCell style={{ padding: '1rem' }}>
                      <Badge
                        render={<button type="button" onClick={() => toggleStaffActive(s)} />}
                        variant="outline"
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
                          height: 'auto',
                        }}
                      >
                        {s.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedStaff(s);
                            setShowAccessModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem',
                            background: 'var(--color-indigo-50)',
                            color: 'var(--color-indigo-700)',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: 'none',
                            height: 'auto',
                          }}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Access
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIdCardStaff(s);
                            setIdCardForm({ employee_code: s.employee_code || "", designation: s.designation || "" });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem',
                            background: s.id_card_issued_at ? '#d1fae5' : 'var(--color-gray-100)',
                            color: s.id_card_issued_at ? '#047857' : 'var(--color-gray-600)',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            border: 'none',
                            height: 'auto',
                          }}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          ID Card
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingStaff(s);
                            setFormData({ email: s.email, password: '', name: s.name });
                            setShowAddModal(true);
                          }}
                          style={{
                            padding: '0.375rem',
                            background: 'var(--color-gray-100)',
                            borderRadius: '0.375rem',
                            border: 'none',
                            height: 'auto',
                            width: 'auto',
                          }}
                        >
                          <Edit2 className="w-4 h-4" style={{ color: 'var(--color-gray-500)' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(s.id)}
                          style={{
                            padding: '0.375rem',
                            background: '#fef2f2',
                            borderRadius: '0.375rem',
                            border: 'none',
                            height: 'auto',
                            width: 'auto',
                          }}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Add/Edit Staff Modal */}
      <Dialog
        open={showAddModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="crm-modal" style={{ maxWidth: '24rem' }}>
          <DialogHeader className="modal-header">
            <DialogTitle className="font-normal text-inherit" render={<h2 />}>
              {editingStaff ? "Edit Staff" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>

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
                  <Label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.375rem' }}>
                    Email
                  </Label>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, email: e.target.value }));
                        // Clear lookup result when email changes
                        if (emailLookupResult) setEmailLookupResult(null);
                      }}
                      onBlur={(e) => handleEmailLookup(e.target.value)}
                      required
                      disabled={!!editingStaff}
                      placeholder="staff@example.com"
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: lookingUpEmail || emailLookupResult ? '2.5rem' : '0.75rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        border: emailLookupResult?.exists && !emailLookupResult.isStaff && !emailLookupResult.isAdmin ? '1px solid #22c55e' : '1px solid var(--color-gray-300)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        opacity: editingStaff ? 0.6 : 1,
                        height: 'auto',
                      }}
                    />
                    <Mail className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', zIndex: 10, pointerEvents: 'none' }} />
                    {lookingUpEmail && (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-indigo-500)', zIndex: 10, pointerEvents: 'none' }} />
                    )}
                    {!lookingUpEmail && emailLookupResult?.exists && !emailLookupResult.isStaff && !emailLookupResult.isAdmin && (
                      <CheckCircle className="w-4 h-4" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', zIndex: 10, pointerEvents: 'none' }} />
                    )}
                  </div>
                  {!editingStaff && emailLookupResult?.exists && !emailLookupResult.isStaff && !emailLookupResult.isAdmin && (
                    <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle className="w-3 h-3" />
                      Account found! Name has been auto-filled.
                    </p>
                  )}
                  {!editingStaff && !emailLookupResult?.exists && emailLookupResult !== null && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.375rem' }}>
                      New user - a password will be required.
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <Label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.375rem' }}>
                    Full Name {emailLookupResult?.exists && !emailLookupResult.isStaff && !emailLookupResult.isAdmin && <span style={{ fontWeight: 400, color: '#22c55e' }}>(auto-filled)</span>}
                  </Label>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="John Doe"
                      readOnly={emailLookupResult?.exists && !emailLookupResult.isStaff && !emailLookupResult.isAdmin}
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '0.75rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        border: '1px solid var(--color-gray-300)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: emailLookupResult?.exists && !emailLookupResult.isStaff && !emailLookupResult.isAdmin ? 'var(--color-gray-100)' : 'white',
                        height: 'auto',
                      }}
                    />
                    <User className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', zIndex: 10, pointerEvents: 'none' }} />
                  </div>
                  {!editingStaff && !emailLookupResult?.exists && emailLookupResult !== null && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.375rem' }}>
                      This name will also be used as the display name in the database.
                    </p>
                  )}
                </div>

                {!editingStaff && (
                  <div style={{ marginBottom: '1rem' }}>
                    <Label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.375rem' }}>
                      Password <span style={{ fontWeight: 400, color: 'var(--color-gray-400)' }}>(optional for existing users)</span>
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Input
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
                          border: '1px solid var(--color-gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          height: 'auto',
                        }}
                      />
                      <Lock className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', zIndex: 10, pointerEvents: 'none' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginTop: '0.375rem' }}>
                      Leave blank if the user already has an account - they&apos;ll use their existing password.
                    </p>
                  </div>
                )}

                {editingStaff && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.375rem' }}>
                      New Password <span style={{ fontWeight: 400, color: 'var(--color-gray-400)' }}>(optional)</span>
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Input
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
                          border: '1px solid var(--color-gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          height: 'auto',
                        }}
                      />
                      <Lock className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', zIndex: 10, pointerEvents: 'none' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginTop: '0.375rem' }}>
                      Enter a new password to reset the staff member&apos;s password
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="btn-admin-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-admin-primary"
                    style={{ flex: 1 }}
                  >
                    {saving ? "Saving..." : editingStaff ? "Save Changes" : "Add Staff"}
                  </Button>
                </div>
              </form>
        </DialogContent>
      </Dialog>

      {/* Access Modal - Sheets & Inquiries */}
      <Dialog
        open={showAccessModal && !!selectedStaff}
        onOpenChange={(open) => {
          if (!open) {
            setShowAccessModal(false);
            setSelectedStaff(null);
            setAccessTab('sheets');
          }
        }}
      >
        {selectedStaff && (
          <DialogContent className="crm-modal" style={{ maxWidth: '32rem' }}>
            <DialogHeader className="modal-header">
              <DialogTitle className="font-normal text-inherit" render={<h2 />}>
                Access for {selectedStaff.name}
              </DialogTitle>
            </DialogHeader>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  <Button
                    variant="ghost"
                    onClick={() => setAccessTab('sheets')}
                    style={{
                      flex: 1,
                      minWidth: 'max-content',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: accessTab === 'sheets' ? '2px solid var(--color-indigo-500)' : '1px solid var(--color-gray-200)',
                      background: accessTab === 'sheets' ? 'var(--color-indigo-50)' : 'white',
                      color: accessTab === 'sheets' ? 'var(--color-indigo-700)' : 'var(--color-gray-500)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 'auto',
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    CRM Sheets
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setAccessTab('inquiries')}
                    style={{
                      flex: 1,
                      minWidth: 'max-content',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: accessTab === 'inquiries' ? '2px solid var(--primary)' : '1px solid var(--color-gray-200)',
                      background: accessTab === 'inquiries' ? 'rgba(243, 106, 42, 0.1)' : 'white',
                      color: accessTab === 'inquiries' ? 'var(--primary)' : 'var(--color-gray-500)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inquiries
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setAccessTab('permissions')}
                    style={{
                      flex: 1,
                      minWidth: 'max-content',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: accessTab === 'permissions' ? '2px solid #10b981' : '1px solid var(--color-gray-200)',
                      background: accessTab === 'permissions' ? '#d1fae5' : 'white',
                      color: accessTab === 'permissions' ? '#047857' : 'var(--color-gray-500)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 'auto',
                    }}
                  >
                    <Shield className="w-4 h-4" />
                    Privileges
                  </Button>
                </div>

                {/* Sheets Tab Content */}
                {accessTab === 'sheets' && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
                      Select which CRM sheets this staff member can view.
                    </p>

                    {sheets.length === 0 ? (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        background: 'var(--color-gray-50)',
                        borderRadius: '0.75rem',
                      }}>
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-gray-400)' }} />
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
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
                                background: hasAccess ? 'var(--color-indigo-50)' : 'var(--color-gray-50)',
                                border: hasAccess ? '2px solid var(--color-indigo-500)' : '1px solid var(--color-gray-200)',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FileSpreadsheet className="w-5 h-5" style={{ color: hasAccess ? 'var(--color-indigo-700)' : 'var(--color-gray-500)' }} />
                                <span style={{ fontWeight: 500, color: hasAccess ? 'var(--color-indigo-700)' : 'var(--color-gray-700)' }}>
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
                                  background: 'var(--color-indigo-500)',
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
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
                      Select which inquiry types this staff member can view.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(['property', 'home_loan', 'interior_design', 'vastu_consultation'] as const).map(type => {
                        const hasAccess = inquiryAccess.some(
                          a => a.staff_id === selectedStaff.id && a.inquiry_type === type
                        );
                        const Icon = getInquiryTypeIcon(type);
                        const colorMap = {
                          property: { bg: 'var(--color-blue-100)', border: 'var(--color-blue-500)', text: 'var(--color-blue-700)' },
                          home_loan: { bg: '#dcfce7', border: '#22c55e', text: '#16a34a' },
                          interior_design: { bg: 'var(--color-purple-50)', border: '#a855f7', text: '#9333ea' },
                          vastu_consultation: { bg: '#ffedd5', border: '#f97316', text: '#c2410c' },
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
                              background: hasAccess ? colors.bg : 'var(--color-gray-50)',
                              border: hasAccess ? `2px solid ${colors.border}` : '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Icon className="w-5 h-5" style={{ color: hasAccess ? colors.text : 'var(--color-gray-500)' }} />
                              <span style={{ fontWeight: 500, color: hasAccess ? colors.text : 'var(--color-gray-700)' }}>
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

                {/* Privileges Tab Content */}
                {accessTab === 'permissions' && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
                      Select which global tools and sections this staff member can access.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Properties Permission */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.875rem 1rem',
                          background: 'white',
                          border: '1px solid var(--color-gray-200)',
                          borderRadius: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Building className="w-5 h-5 text-gray-500" />
                          <div>
                            <span style={{ fontWeight: 500, color: 'var(--color-gray-700)', display: 'block' }}>
                              Manage Properties
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                              Allows adding and editing real estate listings
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleStaffPermission(selectedStaff.id, 'can_manage_properties', selectedStaff.can_manage_properties)}
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
                            background: selectedStaff.can_manage_properties ? '#dcfce7' : 'var(--color-gray-100)',
                            color: selectedStaff.can_manage_properties ? '#166534' : 'var(--color-gray-600)',
                          }}
                        >
                          {selectedStaff.can_manage_properties ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Invoices Permission */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.875rem 1rem',
                          background: 'white',
                          border: '1px solid var(--color-gray-200)',
                          borderRadius: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                          <div>
                            <span style={{ fontWeight: 500, color: 'var(--color-gray-700)', display: 'block' }}>
                              Invoice Generator
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                              Allows creating and printing official invoices
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleStaffPermission(selectedStaff.id, 'can_generate_invoices', selectedStaff.can_generate_invoices)}
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
                            background: selectedStaff.can_generate_invoices ? '#dcfce7' : 'var(--color-gray-100)',
                            color: selectedStaff.can_generate_invoices ? '#166534' : 'var(--color-gray-600)',
                          }}
                        >
                          {selectedStaff.can_generate_invoices ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Add Sheets Permission */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.875rem 1rem',
                          background: 'white',
                          border: '1px solid var(--color-gray-200)',
                          borderRadius: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                          <div>
                            <span style={{ fontWeight: 500, color: 'var(--color-gray-700)', display: 'block' }}>
                              Create CRM Sheets & Add Leads
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                              Allows creating new sheets and adding own leads
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleStaffPermission(selectedStaff.id, 'can_add_sheets', selectedStaff.can_add_sheets)}
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
                            background: selectedStaff.can_add_sheets ? '#dcfce7' : 'var(--color-gray-100)',
                            color: selectedStaff.can_add_sheets ? '#166534' : 'var(--color-gray-600)',
                          }}
                        >
                          {selectedStaff.can_add_sheets ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
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
          </DialogContent>
        )}
      </Dialog>

      {/* ID Card Modal */}
      <Dialog
        open={!!idCardStaff}
        onOpenChange={(open) => {
          if (!open) setIdCardStaff(null);
        }}
      >
        {idCardStaff && (
          <DialogContent className="crm-modal" style={{ maxWidth: '24rem' }}>
            <DialogHeader className="modal-header">
              <DialogTitle className="font-normal text-inherit" render={<h2 />}>
                ID Card — {idCardStaff.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleGenerateIdCard} style={{ padding: '1.5rem' }}>
              {idCardStaff.id_card_issued_at && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem', background: '#d1fae5', color: '#047857',
                  borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8125rem',
                }}>
                  <CheckCircle className="w-4 h-4" />
                  Issued on {new Date(idCardStaff.id_card_issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <Label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.375rem' }}>
                  Employee Code
                </Label>
                <Input
                  type="text"
                  value={idCardForm.employee_code}
                  onChange={(e) => setIdCardForm((f) => ({ ...f, employee_code: e.target.value }))}
                  placeholder="e.g., GH24-014"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--color-gray-300)', borderRadius: '0.5rem', fontSize: '0.875rem', height: 'auto' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.375rem' }}>
                  Designation
                </Label>
                <Input
                  type="text"
                  value={idCardForm.designation}
                  onChange={(e) => setIdCardForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="e.g., Sales Executive"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--color-gray-300)', borderRadius: '0.5rem', fontSize: '0.875rem', height: 'auto' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  type="button"
                  onClick={() => setIdCardStaff(null)}
                  className="btn-admin-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generatingIdCard}
                  className="btn-admin-primary"
                  style={{ flex: 1 }}
                >
                  {generatingIdCard ? "Saving..." : idCardStaff.id_card_issued_at ? "Regenerate ID Card" : "Generate ID Card"}
                </Button>
              </div>
              {idCardStaff.id_card_issued_at && (
                <Button
                  type="button"
                  disabled={generatingIdCard}
                  onClick={handleRemoveIdCard}
                  className="btn-admin-danger"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove ID Card
                </Button>
              )}
            </form>
          </DialogContent>
        )}
      </Dialog>

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
