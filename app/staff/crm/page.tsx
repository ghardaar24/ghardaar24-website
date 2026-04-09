"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStaffAuth, supabaseStaff } from "@/lib/staff-auth";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Search,
  Filter,
  Phone,
  Calendar,
  MapPin,
  MessageSquare,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  FileSpreadsheet,
  Lock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";

// Types
interface CallingCommentEntry {
  comment: string;
  date: string;
  addedBy?: string;
  addedById?: string;
  addedByRole?: "admin" | "staff";
}

interface CRMClient {
  id: string;
  client_name: string;
  customer_number: string | null;
  lead_stage: "follow_up_req" | "dnp" | "disqualified" | "callback_required" | "natc" | "visit_booked" | "call_after_1_2_months" | "vdnb";
  lead_type: "hot" | "warm" | "cold";
  location_category: string | null;
  facing: string | null;
  calling_comment: string | null;
  calling_comment_history: CallingCommentEntry[];
  expected_visit_date: string | null;
  expected_visit_time: string | null;
  deal_status: "open" | "locked" | "lost";
  admin_notes: string | null;
  sheet_id: string | null;
  added_by?: string | null;
  created_at: string;
}

interface CRMSheet {
  id: string;
  name: string;
  description: string | null;
  created_by_staff: string | null;
}

type FilterState = {
  search: string;
  leadStage: string;
  leadType: string;
  dealStatus: string;
  locationCategory: string;
};

const LEAD_STAGE_OPTIONS = [
  { value: "dnp", label: "DNP", color: "#6b7280" }, // Gray
  { value: "callback_required", label: "Callback Required", color: "#eab308" }, // Yellow
  { value: "follow_up_req", label: "Follow up Required", color: "#f59e0b" }, // Amber
  { value: "natc", label: "NATC", color: "#9ca3af" }, // Light Gray
  { value: "visit_booked", label: "VISIT BOOKED", color: "#15803d" }, // Green
  { value: "disqualified", label: "Disqualified", color: "#dc2626" }, // Red
  { value: "call_after_1_2_months", label: "Call after 1-2 Months", color: "#8b5cf6" }, // Violet
  { value: "vdnb", label: "VDNB", color: "#14b8a6" }, // Teal
];

const LEAD_TYPE_OPTIONS = [
  { value: "hot", label: "Hot", color: "#ef4444" },
  { value: "warm", label: "Warm", color: "#f59e0b" },
  { value: "cold", label: "Cold", color: "#3b82f6" },
];

const DEAL_STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "#f59e0b" },
  { value: "locked", label: "Deal Locked", color: "#22c55e" },
  { value: "lost", label: "Lost", color: "#6b7280" },
];

const ITEMS_PER_PAGE = 100;

export default function StaffCRMPage() {
  const searchParams = useSearchParams();
  const { staffProfile, session, accessibleSheets, loading: authLoading } = useStaffAuth();
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [sheets, setSheets] = useState<CRMSheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    leadStage: "",
    leadType: "",
    dealStatus: "",
    locationCategory: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<CRMClient | null>(null);
  const [formData, setFormData] = useState({
    lead_stage: "follow_up_req" as CRMClient["lead_stage"],
    lead_type: "cold" as CRMClient["lead_type"],
    location_category: "",
    expected_visit_date: "",
    expected_visit_time: "",
    deal_status: "open" as CRMClient["deal_status"],
    facing: "",
  });

  // Add Lead State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    client_name: "",
    customer_number: "",
    lead_stage: "follow_up_req" as CRMClient["lead_stage"],
    lead_type: "cold" as CRMClient["lead_type"],
    location_category: "",
    expected_visit_date: "",
    expected_visit_time: "",
    deal_status: "open" as CRMClient["deal_status"],
    facing: "",
    calling_comment: "",
  });
  const [addingLead, setAddingLead] = useState(false);

  // Delete State
  const [deleteLeadConfirm, setDeleteLeadConfirm] = useState<string | null>(null);
  const [deleteSheetConfirm, setDeleteSheetConfirm] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.client_name.trim() || !staffProfile) return;
    setAddingLead(true);
    try {
      const payload = {
        client_name: addFormData.client_name,
        customer_number: addFormData.customer_number || null,
        lead_stage: addFormData.lead_stage,
        lead_type: addFormData.lead_type,
        location_category: addFormData.location_category || null,
        deal_status: addFormData.deal_status,
        added_by: staffProfile.id,
        sheet_id: null,
        expected_visit_date: addFormData.expected_visit_date || null,
        expected_visit_time: addFormData.expected_visit_time || null,
        facing: addFormData.facing || null,
        calling_comment: addFormData.calling_comment || null,
        calling_comment_history: addFormData.calling_comment
          ? [{ comment: addFormData.calling_comment, date: new Date().toISOString(), addedBy: `Staff - ${staffProfile?.name || "Unknown"}`, addedById: staffProfile?.id, addedByRole: "staff" as const }]
          : [],
      };
      const { data, error } = await supabaseStaff.from("crm_clients").insert([payload]).select().single();
      if (error) throw error;
      
      if (selectedSheetId === "my_leads") {
        setClients((prev) => [data, ...prev]);
      }
      setShowAddModal(false);

      // TRIGGER TASK MODAL IF EXPECTED VISIT DATE IS SET ON NEW LEAD
      if (addFormData.expected_visit_date) {
        setTaskData({
          clientId: data?.id || "",
          clientName: addFormData.client_name,
          title: `Site visit for ${addFormData.client_name}`,
          description: `Automatically created from CRM — expected visit scheduled for ${new Date(addFormData.expected_visit_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
          priority: "high",
          due_date: addFormData.expected_visit_date,
          due_time: addFormData.expected_visit_time || "",
        });
        setShowTaskModal(true);
      }

      setAddFormData({
        client_name: "",
        customer_number: "",
        lead_stage: "follow_up_req",
        lead_type: "cold",
        location_category: "",
        expected_visit_date: "",
        expected_visit_time: "",
        deal_status: "open",
        facing: "",
        calling_comment: "",
      });
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Failed to add lead.");
    } finally {
      setAddingLead(false);
    }
  };

  // Delete lead handler
  const handleDeleteLead = async (clientId: string) => {
    try {
      const { error } = await supabaseStaff.from("crm_clients").delete().eq("id", clientId);
      if (error) throw error;
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      setDeleteLeadConfirm(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead.");
    }
  };

  // Delete sheet handler
  const handleDeleteSheet = async (sheetId: string) => {
    try {
      // Delete all clients in this sheet first
      const { error: clientsError } = await supabaseStaff
        .from("crm_clients")
        .delete()
        .eq("sheet_id", sheetId);
      if (clientsError) throw clientsError;

      // Delete sheet access entries
      const { error: accessError } = await supabaseStaff
        .from("crm_sheet_access")
        .delete()
        .eq("sheet_id", sheetId);
      if (accessError) throw accessError;

      // Delete the sheet
      const { error: sheetError } = await supabaseStaff
        .from("crm_sheets")
        .delete()
        .eq("id", sheetId);
      if (sheetError) throw sheetError;

      setSheets((prev) => prev.filter((s) => s.id !== sheetId));
      setClients((prev) => prev.filter((c) => c.sheet_id !== sheetId));
      if (selectedSheetId === sheetId) {
        setSelectedSheetId("my_leads");
      }
      setDeleteSheetConfirm(null);
    } catch (error) {
      console.error("Error deleting sheet:", error);
      alert("Failed to delete sheet.");
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);


  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ clientId: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  
  // New calling comment state
  const [newCallingComment, setNewCallingComment] = useState<string>("");
  const [addingComment, setAddingComment] = useState(false);

  // Task Assignment State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskData, setTaskData] = useState({
    clientId: "",
    clientName: "",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    due_time: "",
  });
  const [taskSaving, setTaskSaving] = useState(false);

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim() || !staffProfile) {
      alert("Title is required");
      return;
    }
    setTaskSaving(true);
    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        assigned_to: staffProfile.id,
        priority: taskData.priority,
        due_date: taskData.due_date || null,
        due_time: taskData.due_time || null,
        client_id: taskData.clientId || null,
      };
      
      const response = await fetch("/api/staff/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create task");
      
      // Also save the date/time back to the CRM client record
      if (taskData.clientId && (taskData.due_date || taskData.due_time)) {
        const updateData: Record<string, string | null> = {};
        if (taskData.due_date) updateData.expected_visit_date = taskData.due_date;
        if (taskData.due_time) updateData.expected_visit_time = taskData.due_time;
        
        await supabaseStaff
          .from("crm_clients")
          .update(updateData)
          .eq("id", taskData.clientId);
        
        // Update local state
        setClients((prev) =>
          prev.map((c) =>
            c.id === taskData.clientId
              ? {
                  ...c,
                  ...(taskData.due_date ? { expected_visit_date: taskData.due_date } : {}),
                  ...(taskData.due_time ? { expected_visit_time: taskData.due_time } : {}),
                }
              : c
          )
        );
      }
      
      setShowTaskModal(false);
    } catch (err) {
      console.error(err);
      alert("Error creating task.");
    } finally {
      setTaskSaving(false);
    }
  };

  // New sheet creation state
  const [showAddSheetModal, setShowAddSheetModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [newSheetDescription, setNewSheetDescription] = useState("");
  const [creatingSheet, setCreatingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");

  // Fetch accessible sheets
  useEffect(() => {
    async function fetchSheets() {
      if (accessibleSheets.length === 0) {
        setSheets([]);
        // If staff can add sheets/own leads, default to "my_leads" tab
        if (staffProfile?.can_add_sheets && !selectedSheetId) {
          setSelectedSheetId("my_leads");
        }
        setIsLoading(false);
        return;
      }

      try {
        const sheetIds = accessibleSheets.map((s) => s.sheet_id);
        const { data, error } = await supabaseStaff
          .from("crm_sheets")
          .select("*")
          .in("id", sheetIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSheets(data || []);

        // Select first sheet by default
        if (data && data.length > 0 && !selectedSheetId) {
          setSelectedSheetId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching sheets:", error);
      }
    }

    if (!authLoading && staffProfile) {
      fetchSheets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, staffProfile, accessibleSheets]);

  // Fetch clients for selected sheet
  useEffect(() => {
    async function fetchClients() {
      if (!selectedSheetId) {
        setClients([]);
        setIsLoading(false);
        return;
      }

      try {
        let query = supabaseStaff
          .from("crm_clients")
          .select("*")
          .order("created_at", { ascending: false });

        if (selectedSheetId === "my_leads") {
          query = query.is("sheet_id", null).eq("added_by", staffProfile?.id);
        } else {
          query = query.eq("sheet_id", selectedSheetId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedSheetId) {
      setIsLoading(true);
      fetchClients();
    }
  }, [selectedSheetId, staffProfile]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!selectedSheetId) return;

    const channel = supabaseStaff
      .channel('staff_crm_clients_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          const newClient = payload.new as CRMClient;
          // Only add if it belongs to the current sheet or my leads
          if (
            (selectedSheetId === "my_leads" && !newClient.sheet_id && newClient.added_by === staffProfile?.id) ||
            (selectedSheetId !== "my_leads" && newClient.sheet_id === selectedSheetId)
          ) {
            setClients((prev) => [newClient, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          const updatedClient = payload.new as CRMClient;
          setClients((prev) =>
            prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          const deletedId = payload.old.id;
          setClients((prev) => prev.filter((c) => c.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabaseStaff.removeChannel(channel);
    };
  }, [selectedSheetId, staffProfile?.id]);

  // Auto-open client details when navigated from tasks page
  useEffect(() => {
    const clientId = searchParams.get("client_id");
    if (!clientId || !staffProfile) return;

    // First check if client is already loaded
    const existing = clients.find((c) => c.id === clientId);
    if (existing) {
      setSelectedClient(existing);
      setShowDetailsModal(true);
      return;
    }

    // If not found in current view, fetch directly
    async function fetchClientById() {
      try {
        const { data, error } = await supabaseStaff
          .from("crm_clients")
          .select("*")
          .eq("id", clientId!)
          .single();
        if (error) throw error;
        if (data) {
          setSelectedClient(data);
          setShowDetailsModal(true);
        }
      } catch (err) {
        console.error("Error fetching client by ID:", err);
      }
    }
    fetchClientById();
  }, [searchParams, clients, staffProfile]);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      !filters.search ||
      client.client_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      client.customer_number?.includes(filters.search) ||
      client.calling_comment?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStage = !filters.leadStage || client.lead_stage === filters.leadStage;
    const matchesType = !filters.leadType || client.lead_type === filters.leadType;
    const matchesStatus = !filters.dealStatus || client.deal_status === filters.dealStatus;
    const matchesLocation =
      !filters.locationCategory ||
      client.location_category?.toLowerCase().includes(filters.locationCategory.toLowerCase());

    return matchesSearch && matchesStage && matchesType && matchesStatus && matchesLocation;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedSheetId]);

  // Get unique locations for filter
  const uniqueLocations = [...new Set(clients.map((c) => c.location_category).filter(Boolean))];

  // Stats
  const stats = {
    total: clients.length,
    hot: clients.filter((c) => c.lead_type === "hot").length,
    warm: clients.filter((c) => c.lead_type === "warm").length,
    cold: clients.filter((c) => c.lead_type === "cold").length,
    locked: clients.filter((c) => c.deal_status === "locked").length,
  };

  // Get badge styles
  const getLeadTypeBadge = (type: CRMClient["lead_type"]) => {
    const option = LEAD_TYPE_OPTIONS.find((o) => o.value === type);
    return { backgroundColor: `${option?.color}20`, color: option?.color };
  };

  const getLeadStageBadge = (stage: CRMClient["lead_stage"]) => {
    const option = LEAD_STAGE_OPTIONS.find((o) => o.value === stage);
    return { backgroundColor: `${option?.color}20`, color: option?.color };
  };

  const getDealStatusBadge = (status: CRMClient["deal_status"]) => {
    const option = DEAL_STATUS_OPTIONS.find((o) => o.value === status);
    return { backgroundColor: `${option?.color}20`, color: option?.color };
  };

  // Start inline editing
  const startEditing = (clientId: string, field: string, currentValue: string) => {
    setEditingCell({ clientId, field });
    setEditingValue(currentValue || "");
  };

  // Cancel inline editing
  const cancelEditing = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  // Log activity to the database
  const logActivity = async (
    client: CRMClient,
    actionType: string,
    fieldChanged: string | null,
    oldValue: string | null,
    newValue: string | null
  ) => {
    if (!staffProfile) return;
    
    try {
      const sheet = sheets.find(s => s.id === client.sheet_id);
      
      await supabaseStaff
        .from("crm_activity_logs")
        .insert({
          staff_id: staffProfile.id,
          staff_name: staffProfile.name,
          client_id: client.id,
          client_name: client.client_name,
          sheet_id: client.sheet_id,
          sheet_name: sheet?.name || null,
          action_type: actionType,
          field_changed: fieldChanged,
          old_value: oldValue,
          new_value: newValue,
        });
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't block the main operation if logging fails
    }
  };

  // Format date+time for display in the CRM table
  const formatVisitDateTime = (date: string | null, time: string | null) => {
    if (!date) return "-";
    const dateStr = new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    if (time) {
      const [hours, minutes] = time.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const timeStr = timeDate.toLocaleTimeString("en-IN", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${dateStr}, ${timeStr}`;
    }
    return dateStr;
  };

  // Get human-readable field label
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      lead_stage: "Lead Stage",
      lead_type: "Lead Type",
      location_category: "Location",
      expected_visit_date: "Expected Visit Date",
      expected_visit_time: "Expected Visit Time",
      deal_status: "Deal Status",
    };
    return labels[field] || field;
  };

  // Get human-readable value for display
  const getDisplayValue = (field: string, value: string | null): string => {
    if (!value) return "empty";
    
    if (field === "lead_stage") {
      return LEAD_STAGE_OPTIONS.find(o => o.value === value)?.label || value;
    }
    if (field === "lead_type") {
      return LEAD_TYPE_OPTIONS.find(o => o.value === value)?.label || value;
    }
    if (field === "deal_status") {
      return DEAL_STATUS_OPTIONS.find(o => o.value === value)?.label || value;
    }
    return value;
  };

  // Handle inline update
  const handleInlineUpdate = async (clientId: string, field: string, value: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const oldValue = client[field as keyof CRMClient] as string | null;
    
    // Skip if value hasn't changed
    if (oldValue === value || (!oldValue && !value)) {
      cancelEditing();
      return;
    }
    
    try {
      const updateData: Record<string, string | null> = { [field]: value || null };
      
      const { error } = await supabaseStaff
        .from("crm_clients")
        .update(updateData)
        .eq("id", clientId);

      if (error) throw error;

      // Log the activity
      await logActivity(
        client,
        "update_field",
        getFieldLabel(field),
        getDisplayValue(field, oldValue),
        getDisplayValue(field, value || null)
      );

      // Update local state
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, [field]: value || null } : c
        )
      );
      cancelEditing();
      
      // TRIGGER TASK MODAL
      if (field === "lead_stage" && (value === "visit_booked" || value === "follow_up_req")) {
        const clientObj = clients.find(c => c.id === clientId);
        setTaskData({
          clientId,
          clientName: clientObj?.client_name || "",
          title: `Follow up with ${clientObj?.client_name || "Client"}`,
          description: `Automatically created from CRM when stage changed to ${LEAD_STAGE_OPTIONS.find(o => o.value === value)?.label}`,
          priority: value === "visit_booked" ? "high" : "medium",
          due_date: "",
          due_time: "",
        });
        setShowTaskModal(true);
      }

      // TRIGGER TASK MODAL WHEN EXPECTED VISIT DATE IS SET
      if (field === "expected_visit_date" && value) {
        const clientObj = clients.find(c => c.id === clientId);
        setTaskData({
          clientId,
          clientName: clientObj?.client_name || "",
          title: `Site visit for ${clientObj?.client_name || "Client"}`,
          description: `Automatically created from CRM — expected visit scheduled for ${new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
          priority: "high",
          due_date: value,
          due_time: clientObj?.expected_visit_time || "",
        });
        setShowTaskModal(true);
      }
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Failed to update. Please try again.");
    }
  };



  // Handle adding a new calling comment
  const handleAddCallingComment = async () => {
    if (!selectedClient || !newCallingComment.trim()) return;
    
    setAddingComment(true);
    try {
      // Get existing history
      const existingHistory = selectedClient.calling_comment_history || [];
      
      // Create new entry
      const newEntry: CallingCommentEntry = {
        comment: newCallingComment.trim(),
        date: new Date().toISOString(),
        addedBy: `Staff - ${staffProfile?.name || "Unknown"}`,
        addedById: staffProfile?.id,
        addedByRole: "staff",
      };
      
      // Prepend new entry to history
      const updatedHistory = [newEntry, ...existingHistory];
      const latestComment = updatedHistory[0].comment;
      
      const { error } = await supabaseStaff
        .from("crm_clients")
        .update({
          calling_comment: latestComment,
          calling_comment_history: updatedHistory,
        })
        .eq("id", selectedClient.id);

      if (error) throw error;

      // Log the activity
      await logActivity(
        selectedClient,
        "add_comment",
        "Calling Comment",
        null,
        newCallingComment.trim()
      );

      // Update local state
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id 
            ? { ...c, calling_comment: latestComment, calling_comment_history: updatedHistory } 
            : c
        )
      );
      
      // Update selected client
      setSelectedClient({
        ...selectedClient,
        calling_comment: latestComment,
        calling_comment_history: updatedHistory,
      });
      
      // Clear form
      setNewCallingComment("");
    } catch (error) {
      console.error("Error adding calling comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setAddingComment(false);
    }
  };

  // Handle creating a new sheet
  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim() || !staffProfile) return;
    
    setCreatingSheet(true);
    setSheetError("");

    try {
      const response = await fetch("/api/staff/create-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          sheetName: newSheetName.trim(),
          description: newSheetDescription.trim(),
          staffId: staffProfile.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create sheet");
      }

      // Add the new sheet to the UI and select it
      setSheets((prev) => [...prev, result]);
      setSelectedSheetId(result.id);
      
      // Close and reset modal
      setShowAddSheetModal(false);
      setNewSheetName("");
      setNewSheetDescription("");
    } catch (error) {
      console.error("Error creating sheet:", error);
      setSheetError(error instanceof Error ? error.message : "Failed to create sheet");
    } finally {
      setCreatingSheet(false);
    }
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const { error } = await supabaseStaff
        .from("crm_clients")
        .update({
          ...formData,
          expected_visit_date: formData.expected_visit_date || null,
          expected_visit_time: formData.expected_visit_time || null,
          facing: formData.facing || null,
        })
        .eq("id", editingClient.id);

      if (error) throw error;

      // Update local state
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                ...formData,
                expected_visit_date: formData.expected_visit_date || null,
                expected_visit_time: formData.expected_visit_time || null,
                facing: formData.facing || null,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );

      // Log the activity
      // A generic update log, since we don't easily track which fields changed out of many
      await logActivity(
        editingClient,
        "update_field",
        "Client Details",
        null,
        "Updated via Details Edit Modal"
      );

      setShowEditModal(false);

      // TRIGGER TASK MODAL IF STAGE CHANGED
      const isNewStage = formData.lead_stage !== editingClient.lead_stage &&
        (formData.lead_stage === "visit_booked" || formData.lead_stage === "follow_up_req");
      if (isNewStage) {
        setTaskData({
          clientId: editingClient.id,
          clientName: editingClient.client_name,
          title: `Follow up with ${editingClient.client_name}`,
          description: `Automatically created from CRM when stage changed to ${LEAD_STAGE_OPTIONS.find((o) => o.value === formData.lead_stage)?.label}`,
          priority: formData.lead_stage === "visit_booked" ? "high" : "medium",
          due_date: "",
          due_time: "",
        });
        setShowTaskModal(true);
      }

      // TRIGGER TASK MODAL IF EXPECTED VISIT DATE IS SET/CHANGED
      const isNewVisitDate = formData.expected_visit_date && formData.expected_visit_date !== editingClient.expected_visit_date;
      if (isNewVisitDate && !isNewStage) {
        setTaskData({
          clientId: editingClient.id,
          clientName: editingClient.client_name,
          title: `Site visit for ${editingClient.client_name}`,
          description: `Automatically created from CRM — expected visit scheduled for ${new Date(formData.expected_visit_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
          priority: "high",
          due_date: formData.expected_visit_date,
          due_time: formData.expected_visit_time || "",
        });
        setShowTaskModal(true);
      }
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (sheets.length === 0 && !isLoading && !staffProfile?.can_add_sheets) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Access</h2>
        <p className="text-gray-500">
          You don&apos;t have access to any CRM sheets yet.
          <br />
          Please contact your admin to grant access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Clients</h1>
          <p className="text-gray-500">View and search client data</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
          {staffProfile?.can_add_sheets && (
            <button
              onClick={() => setShowAddSheetModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm font-medium border border-indigo-200"
            >
              <Plus className="w-5 h-5" />
              Add New Sheet
            </button>
          )}
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="staff-tabs-container">
        <button
          onClick={() => setSelectedSheetId("my_leads")}
          className={`staff-tab ${selectedSheetId === "my_leads" ? "active" : ""}`}
        >
          <Users className="w-4 h-4" />
          My Uploaded Leads
        </button>
        {sheets.map((sheet) => (
          <div key={sheet.id} className="flex items-center">
            <button
              onClick={() => setSelectedSheetId(sheet.id)}
              className={`staff-tab ${selectedSheetId === sheet.id ? "active" : ""}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {sheet.name}
            </button>
            {sheet.created_by_staff === staffProfile?.id && (
              <button
                onClick={() => setDeleteSheetConfirm(sheet.id)}
                className="p-1 ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Delete sheet"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="staff-stats-row">
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon primary">
              <Users className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Total</span>
              <span className="staff-stat-value">{stats.total}</span>
            </div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon danger">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Hot</span>
              <span className="staff-stat-value">{stats.hot}</span>
            </div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon warning">
              <Clock className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Warm</span>
              <span className="staff-stat-value">{stats.warm}</span>
            </div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon info">
              <Users className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Cold</span>
              <span className="staff-stat-value">{stats.cold}</span>
            </div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon success">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Locked</span>
              <span className="staff-stat-value">{stats.locked}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Visits & Followups */}
      {(() => {
        const upcomingClients = clients
          .filter(
            (c) =>
              (c.lead_stage === "visit_booked" || c.lead_stage === "follow_up_req") &&
              c.expected_visit_date &&
              new Date(c.expected_visit_date) >= new Date(new Date().toDateString())
          )
          .sort(
            (a, b) =>
              new Date(a.expected_visit_date!).getTime() - new Date(b.expected_visit_date!).getTime()
          )
          .slice(0, 5);

        if (upcomingClients.length === 0) return null;

        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Upcoming Visits & Followups
            </h3>
            <div className="flex flex-col gap-2">
              {upcomingClients.map((c) => {
                const stageOpt = LEAD_STAGE_OPTIONS.find((o) => o.value === c.lead_stage);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedClient(c);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                        style={{ backgroundColor: `${stageOpt?.color}20`, color: stageOpt?.color }}
                      >
                        {stageOpt?.label}
                      </span>
                      <span className="font-medium text-gray-900 text-sm">{c.client_name}</span>
                      {c.customer_number && (
                        <span className="text-xs text-gray-400">{c.customer_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">{formatVisitDateTime(c.expected_visit_date, c.expected_visit_time)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Search and Filters */}
      <div className="staff-filters-card">
        <div className="staff-search-row">
          <div className="staff-search-input">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or notes..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`staff-filter-btn ${showFilters ? "active" : ""}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="staff-filters-grid"
            >
              <select
                value={filters.leadStage}
                onChange={(e) => setFilters((prev) => ({ ...prev, leadStage: e.target.value }))}
                className="staff-filter-select"
              >
                <option value="">All Stages</option>
                {LEAD_STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.leadType}
                onChange={(e) => setFilters((prev) => ({ ...prev, leadType: e.target.value }))}
                className="staff-filter-select"
              >
                <option value="">All Types</option>
                {LEAD_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.dealStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, dealStatus: e.target.value }))}
                className="staff-filter-select"
              >
                <option value="">All Status</option>
                {DEAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.locationCategory}
                onChange={(e) => setFilters((prev) => ({ ...prev, locationCategory: e.target.value }))}
                className="staff-filter-select"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc || ""}>
                    {loc}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Table */}
      <div className="staff-table-container">
        {isLoading ? (
          <div className="staff-loading">
            <div className="staff-loading-spinner"></div>
            <p>Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="staff-empty-state">
            <Users className="w-12 h-12" />
            <p>No clients found matching your search.</p>
          </div>
        ) : (
          <>


          <div className="staff-table-wrapper">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lead Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expected Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetailsModal(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{client.client_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {client.customer_number && (
                        <a
                          href={`tel:${client.customer_number}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {client.customer_number}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "lead_stage" ? (
                        <select
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "lead_stage", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-select"
                          style={{ ...getLeadStageBadge(editingValue as CRMClient["lead_stage"]), minWidth: "120px" }}
                        >
                          {LEAD_STAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                          style={getLeadStageBadge(client.lead_stage)}
                          onClick={() => startEditing(client.id, "lead_stage", client.lead_stage)}
                        >
                          {LEAD_STAGE_OPTIONS.find((o) => o.value === client.lead_stage)?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "lead_type" ? (
                        <select
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "lead_type", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-select"
                          style={{ ...getLeadTypeBadge(editingValue as CRMClient["lead_type"]), minWidth: "80px" }}
                        >
                          {LEAD_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                          style={getLeadTypeBadge(client.lead_type)}
                          onClick={() => startEditing(client.id, "lead_type", client.lead_type)}
                        >
                          {LEAD_TYPE_OPTIONS.find((o) => o.value === client.lead_type)?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "location_category" ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => handleInlineUpdate(client.id, "location_category", editingValue)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleInlineUpdate(client.id, "location_category", editingValue);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          autoFocus
                          className="crm-inline-input"
                          placeholder="Enter location"
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-all"
                          onClick={() => startEditing(client.id, "location_category", client.location_category || "")}
                        >
                          {client.location_category || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "expected_visit_date" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="date"
                            value={editingValue}
                            onChange={(e) => handleInlineUpdate(client.id, "expected_visit_date", e.target.value)}
                            onBlur={cancelEditing}
                            onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                            autoFocus
                            className="crm-inline-input"
                            style={{ maxWidth: '130px' }}
                          />
                        </div>
                      ) : editingCell?.clientId === client.id && editingCell?.field === "expected_visit_time" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={editingValue}
                            onChange={(e) => handleInlineUpdate(client.id, "expected_visit_time", e.target.value)}
                            onBlur={cancelEditing}
                            onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                            autoFocus
                            className="crm-inline-input"
                            style={{ maxWidth: '110px' }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded transition-all text-sm"
                            onClick={() => startEditing(client.id, "expected_visit_date", client.expected_visit_date || "")}
                          >
                            {client.expected_visit_date
                              ? new Date(client.expected_visit_date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "-"}
                          </span>
                          {client.expected_visit_date && (
                            <span
                              className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded transition-all text-xs text-indigo-600"
                              onClick={() => startEditing(client.id, "expected_visit_time", client.expected_visit_time || "")}
                            >
                              {client.expected_visit_time
                                ? (() => {
                                    const [h, m] = client.expected_visit_time.split(':');
                                    const t = new Date();
                                    t.setHours(parseInt(h, 10), parseInt(m, 10));
                                    return t.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true });
                                  })()
                                : "+ Add time"}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "deal_status" ? (
                        <select
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "deal_status", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-select"
                          style={{ ...getDealStatusBadge(editingValue as CRMClient["deal_status"]), minWidth: "100px" }}
                        >
                          {DEAL_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                          style={getDealStatusBadge(client.deal_status)}
                          onClick={() => startEditing(client.id, "deal_status", client.deal_status)}
                        >
                          {DEAL_STATUS_OPTIONS.find((o) => o.value === client.deal_status)?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {(client.added_by === staffProfile?.id || sheets.find(s => s.id === client.sheet_id)?.created_by_staff === staffProfile?.id) && (
                        <button
                          onClick={() => setDeleteLeadConfirm(client.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Pagination Controls */}
        {filteredClients.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredClients.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedClient && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedClient.client_name}</h3>
                    {selectedClient.customer_number && (
                      <a
                        href={`tel:${selectedClient.customer_number}`}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mt-1 font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedClient.customer_number}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                      style={getLeadTypeBadge(selectedClient.lead_type)}
                    >
                      {LEAD_TYPE_OPTIONS.find((o) => o.value === selectedClient.lead_type)?.label}
                    </span>
                    <span
                      className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                      style={getLeadStageBadge(selectedClient.lead_stage)}
                    >
                      {LEAD_STAGE_OPTIONS.find((o) => o.value === selectedClient.lead_stage)?.label}
                    </span>
                    <span
                      className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                      style={getDealStatusBadge(selectedClient.deal_status)}
                    >
                      {DEAL_STATUS_OPTIONS.find((o) => o.value === selectedClient.deal_status)?.label}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Location
                    </label>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedClient.location_category || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Visit Date
                    </label>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {selectedClient.expected_visit_date
                        ? new Date(selectedClient.expected_visit_date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Not Scheduled"}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <MessageSquare className="w-3 h-3" /> Calling History
                    </label>
                    {selectedClient.calling_comment_history && selectedClient.calling_comment_history.length > 0 ? (
                      <div className="space-y-3">
                        {selectedClient.calling_comment_history.map((entry, index) => (
                          <div key={index} className="relative pl-3 border-l-2 border-indigo-200">
                            <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-indigo-400"></div>
                            <div className="text-xs text-indigo-600 font-medium mb-1">
                              {new Date(entry.date).toLocaleString("en-IN", {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                              {entry.addedBy && entry.addedBy !== 'migrated' && (
                                <span className="ml-2 text-gray-500">by {entry.addedBy}</span>
                              )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm">
                              {entry.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No calling notes added.</p>
                    )}
                  </div>
                  
                  {/* Add New Comment Form */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3 h-3" /> Add New Comment
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={newCallingComment}
                        onChange={(e) => setNewCallingComment(e.target.value)}
                        placeholder="Enter calling notes..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={handleAddCallingComment}
                      disabled={!newCallingComment.trim() || addingComment}
                      className="mt-2 w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      {addingComment ? "Adding..." : "Add Comment"}
                    </button>
                  </div>
                  
                  {selectedClient.admin_notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3 h-3" /> Admin Notes
                      </label>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedClient.admin_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setNewCallingComment(""); // Clear form on close
                    }}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setEditingClient(selectedClient);
                      setFormData({
                        lead_stage: selectedClient.lead_stage,
                        lead_type: selectedClient.lead_type,
                        location_category: selectedClient.location_category || "",
                        expected_visit_date: selectedClient.expected_visit_date || "",
                        expected_visit_time: selectedClient.expected_visit_time || "",
                        deal_status: selectedClient.deal_status,
                        facing: selectedClient.facing || "",
                      });
                      setShowDetailsModal(false);
                      setShowEditModal(true);
                      setNewCallingComment(""); // Clear form on close
                    }}
                    className="flex-[2] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Details
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sheet Modal */}
      <AnimatePresence>
        {showAddSheetModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddSheetModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Create New Sheet</h2>
                <button
                  onClick={() => setShowAddSheetModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSheet} className="p-6 space-y-4">
                {sheetError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{sheetError}</span>
                  </div>
                )}
                
                <div>
                  <label htmlFor="sheetName" className="block text-sm font-medium text-gray-700 mb-1">
                    Sheet Name *
                  </label>
                  <input
                    type="text"
                    id="sheetName"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Q3 Fall Leads"
                  />
                </div>

                <div>
                  <label htmlFor="sheetDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="sheetDescription"
                    value={newSheetDescription}
                    onChange={(e) => setNewSheetDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Notes about this sheet..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSheetModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingSheet || !newSheetName.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                  >
                    {creatingSheet ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Create Sheet"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden border border-gray-100"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Create Task for {taskData.clientName}
                  </h3>
                </div>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={taskData.title}
                      onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                      placeholder="e.g. Call client about property"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={taskData.due_date}
                        onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={taskData.due_time}
                        onChange={(e) => setTaskData({ ...taskData, due_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      value={taskData.priority}
                      onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as "low" | "medium" | "high" })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none min-h-[100px]"
                      value={taskData.description}
                      onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                      placeholder="Task details..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      onClick={() => setShowTaskModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={taskSaving}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 font-medium flex items-center justify-center gap-2"
                    >
                      {taskSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Create Task"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Client Modal */}
      <AnimatePresence>
        {showEditModal && editingClient && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh] border border-gray-100"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Edit2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Edit Client Details
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Read-Only Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        value={editingClient.client_name}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Number
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        value={editingClient.customer_number || ""}
                      />
                    </div>
                    <div className="md:col-span-2 text-xs text-center text-gray-500 mt-[-10px]">
                      Name and phone number cannot be edited by staff.
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Stage *</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={formData.lead_stage}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setFormData({ ...formData, lead_stage: e.target.value as any })}
                      >
                        {LEAD_STAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type *</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={formData.lead_type}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setFormData({ ...formData, lead_type: e.target.value as any })}
                      >
                        {LEAD_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Preference</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.location_category}
                        onChange={(e) => setFormData({ ...formData, location_category: e.target.value })}
                        placeholder="e.g. North City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facing Preference</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.facing}
                        onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                        placeholder="e.g. East, West"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Visit Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.expected_visit_date}
                        onChange={(e) => setFormData({ ...formData, expected_visit_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Visit Time</label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.expected_visit_time}
                        onChange={(e) => setFormData({ ...formData, expected_visit_time: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deal Status *</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={formData.deal_status}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setFormData({ ...formData, deal_status: e.target.value as any })}
                      >
                        {DEAL_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh] border border-gray-100"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Add New Lead
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleAddSubmit} className="space-y-6">
                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.client_name}
                        onChange={(e) => setAddFormData({ ...addFormData, client_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.customer_number}
                        onChange={(e) => setAddFormData({ ...addFormData, customer_number: e.target.value })}
                        placeholder="+91 ..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Stage *</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={addFormData.lead_stage}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setAddFormData({ ...addFormData, lead_stage: e.target.value as any })}
                      >
                        {LEAD_STAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type *</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={addFormData.lead_type}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setAddFormData({ ...addFormData, lead_type: e.target.value as any })}
                      >
                        {LEAD_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Preference</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.location_category}
                        onChange={(e) => setAddFormData({ ...addFormData, location_category: e.target.value })}
                        placeholder="e.g. North City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facing Preference</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.facing}
                        onChange={(e) => setAddFormData({ ...addFormData, facing: e.target.value })}
                        placeholder="e.g. East, West"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Visit Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.expected_visit_date}
                        onChange={(e) => setAddFormData({ ...addFormData, expected_visit_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Visit Time</label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.expected_visit_time}
                        onChange={(e) => setAddFormData({ ...addFormData, expected_visit_time: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Calling Comment</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={addFormData.calling_comment}
                        onChange={(e) => setAddFormData({ ...addFormData, calling_comment: e.target.value })}
                        placeholder="Add a comment..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deal Status *</label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={addFormData.deal_status}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setAddFormData({ ...addFormData, deal_status: e.target.value as any })}
                      >
                        {DEAL_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      onClick={() => setShowAddModal(false)}
                      disabled={addingLead}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingLead}
                      className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow disabled:opacity-50"
                    >
                      {addingLead ? "Saving..." : "Add Lead"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Lead Confirmation Modal */}
      <AnimatePresence>
        {deleteLeadConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteLeadConfirm(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lead</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete <strong>&quot;{clients.find(c => c.id === deleteLeadConfirm)?.client_name}&quot;</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteLeadConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLead(deleteLeadConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Sheet Confirmation Modal */}
      <AnimatePresence>
        {deleteSheetConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteSheetConfirm(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Sheet</h3>
              <p className="text-gray-600 text-sm mb-6">
                This will permanently delete <strong>&quot;{sheets.find(s => s.id === deleteSheetConfirm)?.name}&quot;</strong> and all its leads. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteSheetConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSheet(deleteSheetConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
