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
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Flag,
  Loader2,
  PlayCircle,
  Shield,
  Users,
  Phone,
  MapPin,
  MessageSquare,
  Save,
} from "lucide-react";

interface CallingCommentEntry {
  comment: string;
  date: string;
  addedBy?: string;
}

interface CRMClient {
  id: string;
  client_name: string;
  customer_number: string | null;
  lead_stage: string;
  lead_type: string;
  location_category: string | null;
  calling_comment: string | null;
  calling_comment_history: CallingCommentEntry[];
  expected_visit_date: string | null;
  expected_visit_time: string | null;
  deal_status: string;
  admin_notes: string | null;
  facing: string | null;
  added_by?: string | null;
  sheet_id: string | null;
  created_at: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
  due_time: string | null;
  completed_at: string | null;
  created_at: string;
  client_id: string | null;
  assigned_staff?: { id: string; name: string; email: string };
  assigning_admin?: { id: string; name: string; email: string };
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "#6b7280" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "#6b7280", icon: Clock },
  { value: "in_progress", label: "In Progress", color: "#3b82f6", icon: PlayCircle },
  { value: "completed", label: "Completed", color: "#22c55e", icon: CheckCircle },
];

const LEAD_STAGE_OPTIONS = [
  { value: "dnp", label: "DNP", color: "#6b7280" },
  { value: "callback_required", label: "Callback Required", color: "#eab308" },
  { value: "follow_up_req", label: "Follow up Required", color: "#f59e0b" },
  { value: "natc", label: "NATC", color: "#9ca3af" },
  { value: "visit_booked", label: "VISIT BOOKED", color: "#15803d" },
  { value: "disqualified", label: "Disqualified", color: "#dc2626" },
  { value: "call_after_1_2_months", label: "Call after 1-2 Months", color: "#8b5cf6" },
  { value: "vdnb", label: "VDNB", color: "#14b8a6" },
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

export default function AdminTasksPage() {
  const { user, session, adminProfile, loading: authLoading } = useAdminAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [admins, setAdmins] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Client details modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientDetails, setClientDetails] = useState<CRMClient | null>(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Client edit modal state
  const [showClientEditModal, setShowClientEditModal] = useState(false);
  const [clientEditData, setClientEditData] = useState({
    lead_stage: "",
    lead_type: "",
    location_category: "",
    expected_visit_date: "",
    expected_visit_time: "",
    deal_status: "",
    facing: "",
  });
  const [clientEditSaving, setClientEditSaving] = useState(false);

  // Filter state
  const [filterStaff, setFilterStaff] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOverdue, setFilterOverdue] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    due_time: "",
  });

  useEffect(() => {
    if (!authLoading && session) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session]);

  const fetchData = async () => {
    try {
      // Fetch staff and admins via API (uses service role key, bypasses RLS)
      const staffResponse = await fetch("/api/admin/staff", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (staffResponse.ok) {
        const staffResult = await staffResponse.json();
        if (staffResult.staff) setStaff(staffResult.staff);

        // Use admins from API if available
        if (staffResult.admins && staffResult.admins.length > 0) {
          setAdmins(staffResult.admins);
        } else {
          // Fallback: use current admin profile from auth context
          if (adminProfile) {
            setAdmins([{ id: adminProfile.id, name: adminProfile.name || adminProfile.email, email: adminProfile.email }]);
          }
        }
      } else if (adminProfile) {
        // API failed, at least add current admin
        setAdmins([{ id: adminProfile.id, name: adminProfile.name || adminProfile.email, email: adminProfile.email }]);
      }

      await fetchTasks();
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStaff) params.append("staff_id", filterStaff);
      if (filterStatus) params.append("status", filterStatus);

      const response = await fetch(`/api/admin/tasks?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStaff, filterStatus, session]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      priority: "medium",
      due_date: "",
      due_time: "",
    });
    setEditingTask(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      due_time: task.due_time || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assigned_to) {
      setError("Title and assignee are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        due_date: formData.due_date || null,
        due_time: formData.due_time || null,
        ...(editingTask && { id: editingTask.id }),
      };

      const response = await fetch("/api/admin/tasks", {
        method: editingTask ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save task");
      }

      setSuccess(editingTask ? "Task updated successfully" : "Task created successfully");
      setTimeout(() => setSuccess(""), 3000);
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/admin/tasks?id=${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete task");
      }

      setSuccess("Task deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatDate = (dateString: string | null, timeString?: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    if (timeString) {
      const [hours, minutes] = timeString.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const timeStr = timeDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateStr} at ${timeStr}`;
    }
    return dateStr;
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  // Build a local name lookup from admins + staff for fallback
  const nameMap = new Map<string, string>();
  admins.forEach((a) => nameMap.set(a.id, a.name || a.email));
  staff.forEach((s) => nameMap.set(s.id, s.name || s.email));

  const getAssigneeName = (task: Task): string => {
    if (task.assigned_staff?.name) return task.assigned_staff.name;
    return nameMap.get(task.assigned_to) || "Unassigned";
  };

  // Separate tasks
  const adminIds = new Set(admins.map((a) => a.id));
  const filteredTasks = filterOverdue ? tasks.filter(isOverdue) : tasks;
  const adminTasks = filteredTasks.filter((t) => adminIds.has(t.assigned_to));
  const staffTasks = filteredTasks.filter((t) => !adminIds.has(t.assigned_to));

  // Stats
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const overdueCount = tasks.filter(isOverdue).length;

  if (authLoading || loading) {
    return (
      <div className="admin-page">
        <div className="dashboard-loading">
          <motion.div
            className="loading-spinner-large"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  const handleViewClient = (clientId: string) => {
    window.location.href = `/admin/crm?client_id=${clientId}`;
  };

  const handleViewClientByName = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("crm_clients")
        .select("id")
        .ilike("client_name", name)
        .limit(1)
        .single();
      if (error) throw error;
      if (data) {
        window.location.href = `/admin/crm?client_id=${data.id}`;
      }
    } catch (err) {
      console.error("Error fetching client by name:", err);
    }
  };

  const openClientEditModal = (client: CRMClient) => {
    setClientEditData({
      lead_stage: client.lead_stage || "",
      lead_type: client.lead_type || "",
      location_category: client.location_category || "",
      expected_visit_date: client.expected_visit_date ? client.expected_visit_date.split("T")[0] : "",
      expected_visit_time: client.expected_visit_time || "",
      deal_status: client.deal_status || "",
      facing: client.facing || "",
    });
    setShowClientEditModal(true);
  };

  const handleClientEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDetails) return;
    setClientEditSaving(true);
    try {
      const { error } = await supabase
        .from("crm_clients")
        .update({
          lead_stage: clientEditData.lead_stage,
          lead_type: clientEditData.lead_type,
          location_category: clientEditData.location_category || null,
          expected_visit_date: clientEditData.expected_visit_date || null,
          expected_visit_time: clientEditData.expected_visit_time || null,
          deal_status: clientEditData.deal_status,
          facing: clientEditData.facing || null,
        })
        .eq("id", clientDetails.id);
      if (error) throw error;

      // Update local clientDetails
      const updated = {
        ...clientDetails,
        lead_stage: clientEditData.lead_stage,
        lead_type: clientEditData.lead_type,
        location_category: clientEditData.location_category || null,
        expected_visit_date: clientEditData.expected_visit_date || null,
        expected_visit_time: clientEditData.expected_visit_time || null,
        deal_status: clientEditData.deal_status,
        facing: clientEditData.facing || null,
      };
      setClientDetails(updated);
      setShowClientEditModal(false);
    } catch (err) {
      console.error("Error updating client:", err);
      alert("Failed to update client. Please try again.");
    } finally {
      setClientEditSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const renderTaskCard = (task: Task) => {
    const priorityOpt = PRIORITY_OPTIONS.find((p) => p.value === task.priority);
    const statusOpt = STATUS_OPTIONS.find((s) => s.value === task.status);
    const StatusIcon = statusOpt?.icon || Clock;
    const overdue = isOverdue(task);

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        style={{
          background: overdue ? "rgba(239, 68, 68, 0.03)" : "var(--surface-soft, #fafafa)",
          borderRadius: "12px",
          padding: "1.25rem",
          border: overdue ? "1px solid var(--error, #ef4444)" : "1px solid var(--border, #e5e7eb)",
          transition: "all 0.2s",
        }}
      >
        {/* Header: title + badges on left, actions on right */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground, #1f2937)", margin: "0 0 0.5rem" }}
            >
              {task.title}
              {(() => {
                const isCrmTask = task.client_id || task.description?.includes("Automatically created from CRM") || task.title?.startsWith("Site visit for");
                if (!isCrmTask) return null;
                const clientName = task.title?.replace("Site visit for ", "").trim();
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (task.client_id) {
                        handleViewClient(task.client_id);
                      } else if (clientName) {
                        handleViewClientByName(clientName);
                      }
                    }}
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.813rem",
                      fontWeight: 600,
                      color: "var(--primary, #f36a2a)",
                      background: "rgba(243, 106, 42, 0.08)",
                      border: "1px solid rgba(243, 106, 42, 0.2)",
                      borderRadius: "6px",
                      padding: "0.15rem 0.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      verticalAlign: "middle",
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = 'rgba(243, 106, 42, 0.15)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = 'rgba(243, 106, 42, 0.08)'; }}
                  >
                    View Client
                  </button>
                );
              })()}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, background: `${priorityOpt?.color}20`, color: priorityOpt?.color }}>
                <Flag className="w-3 h-3" />
                {priorityOpt?.label}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, background: `${statusOpt?.color}20`, color: statusOpt?.color }}>
                <StatusIcon className="w-3 h-3" />
                {statusOpt?.label}
              </span>
              {overdue && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.813rem", borderRadius: "8px", minWidth: "120px", border: "2px solid #e5e7eb", background: "#fafafa", color: "#1f2937", cursor: "pointer" }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => openEditModal(task)}
              title="Edit"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", background: "transparent", color: "var(--text-muted, #9ca3af)", borderRadius: "8px", cursor: "pointer" }}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              title="Delete"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "none", background: "transparent", color: "var(--text-muted, #9ca3af)", borderRadius: "8px", cursor: "pointer" }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p style={{ color: "var(--text-secondary, #6b7280)", fontSize: "0.875rem", margin: "0 0 0.75rem", lineHeight: 1.5 }}>{task.description}</p>
        )}

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.813rem", color: "var(--text-muted, #9ca3af)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <User className="w-4 h-4" />
            {getAssigneeName(task)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Calendar className="w-4 h-4" />
            {formatDate(task.due_date, task.due_time)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Clock className="w-4 h-4" />
            Created {formatDate(task.created_at)}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <Link href="/admin" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1>Task Management</h1>
          <p>Assign and manage tasks for admins and staff members</p>
        </div>
        <motion.button
          className="btn-core btn-primary"
          onClick={openAddModal}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Assign Task
        </motion.button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.875rem", fontWeight: 500, background: "#d1fae5", color: "#065f46" }}
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.875rem", fontWeight: 500, background: "#fee2e2", color: "#991b1b" }}
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <div className="dashboard-stat-card" style={{ "--stat-gradient": "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" } as React.CSSProperties}>
          <div className="dashboard-stat-icon"><Clock className="w-5 h-5" /></div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">{pendingCount}</span>
            <span className="dashboard-stat-label">Pending</span>
          </div>
        </div>
        <div className="dashboard-stat-card" style={{ "--stat-gradient": "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" } as React.CSSProperties}>
          <div className="dashboard-stat-icon"><PlayCircle className="w-5 h-5" /></div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">{inProgressCount}</span>
            <span className="dashboard-stat-label">In Progress</span>
          </div>
        </div>
        <div className="dashboard-stat-card" style={{ "--stat-gradient": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" } as React.CSSProperties}>
          <div className="dashboard-stat-icon"><CheckCircle className="w-5 h-5" /></div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">{completedCount}</span>
            <span className="dashboard-stat-label">Completed</span>
          </div>
        </div>
        <div className="dashboard-stat-card" style={{ "--stat-gradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" } as React.CSSProperties}>
          <div className="dashboard-stat-icon"><AlertCircle className="w-5 h-5" /></div>
          <div className="dashboard-stat-info">
            <span className="dashboard-stat-value">{overdueCount}</span>
            <span className="dashboard-stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-section-card">
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Filter by Assignee</label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "2px solid #e5e7eb", background: "#fafafa", fontSize: "0.875rem", color: "#1f2937" }}
            >
              <option value="">All Assignees</option>
              {admins.length > 0 && (
                <optgroup label="Admins">
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </optgroup>
              )}
              {staff.length > 0 && (
                <optgroup label="Staff">
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "2px solid #e5e7eb", background: "#fafafa", fontSize: "0.875rem", color: "#1f2937" }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={() => setFilterOverdue((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1rem",
                borderRadius: "10px",
                border: `2px solid ${filterOverdue ? "#ef4444" : "#e5e7eb"}`,
                background: filterOverdue ? "rgba(239, 68, 68, 0.1)" : "#fafafa",
                color: filterOverdue ? "#ef4444" : "#6b7280",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <AlertCircle className="w-4 h-4" />
              Overdue Only
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="admin-section-card">
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Clock className="w-12 h-12" style={{ color: "var(--text-muted)", marginBottom: "1rem", margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>No tasks found. Create one to get started!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Admin Tasks Section */}
          {adminTasks.length > 0 && (
            <div className="admin-section-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid #f3f4f6" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Admin Tasks</h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>{adminTasks.length} task{adminTasks.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {adminTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {/* Staff Tasks Section */}
          {staffTasks.length > 0 && (
            <div className="admin-section-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid #f3f4f6" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Staff Tasks</h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>{staffTasks.length} task{staffTasks.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {staffTasks.map(renderTaskCard)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "520px",
                maxHeight: "90vh",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, var(--primary, #f36a2a) 0%, var(--primary-dark, #d4551a) 100%)",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {editingTask ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem", letterSpacing: "-0.01em" }}>
                      {editingTask ? "Edit Task" : "Assign New Task"}
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                      {editingTask ? "Update the task details below" : "Fill in the details to create a new task"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={handleSubmit}
                style={{
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem",
                      background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                      color: "#dc2626",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      border: "1px solid #fca5a5",
                    }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                {/* Title */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    <Flag className="w-4 h-4" style={{ color: "var(--primary, #f36a2a)" }} />
                    Task Title
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                    style={{
                      width: "100%",
                      padding: "0.875rem 1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "#fafafa",
                      color: "#1f2937",
                      fontSize: "0.9375rem",
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    <Edit2 className="w-4 h-4" style={{ color: "var(--primary, #f36a2a)" }} />
                    Description
                    <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#9ca3af", background: "#f3f4f6", padding: "0.125rem 0.5rem", borderRadius: "100px", textTransform: "lowercase", letterSpacing: 0, marginLeft: "auto" }}>Optional</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add detailed instructions or notes..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.875rem 1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "#fafafa",
                      color: "#1f2937",
                      fontSize: "0.9375rem",
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "vertical",
                      minHeight: "80px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Assign To */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    <User className="w-4 h-4" style={{ color: "var(--primary, #f36a2a)" }} />
                    Assign To
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
                  </label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.875rem 1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "#fafafa",
                      color: "#1f2937",
                      fontSize: "0.9375rem",
                      fontFamily: "inherit",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Choose a person...</option>
                    {admins.length > 0 && (
                      <optgroup label="Admins">
                        {admins.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} &bull; {a.email}</option>
                        ))}
                      </optgroup>
                    )}
                    {staff.length > 0 ? (
                      <optgroup label="Staff">
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} &bull; {s.email}</option>
                        ))}
                      </optgroup>
                    ) : (
                      <option value="" disabled>No active staff members found</option>
                    )}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    <Flag className="w-4 h-4" style={{ color: "var(--primary, #f36a2a)" }} />
                    Priority Level
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {PRIORITY_OPTIONS.map((p) => (
                      <label
                        key={p.value}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 0.5rem",
                          border: `2px solid ${formData.priority === p.value ? p.color : "#e5e7eb"}`,
                          borderRadius: "10px",
                          background: formData.priority === p.value ? `${p.color}20` : `${p.color}08`,
                          color: formData.priority === p.value ? p.color : "#6b7280",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p.value}
                          checked={formData.priority === p.value}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                          style={{ display: "none" }}
                        />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Due Date & Time */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                      <Calendar className="w-4 h-4" style={{ color: "var(--primary, #f36a2a)" }} />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.875rem 1rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "12px",
                        background: "#fafafa",
                        color: "#1f2937",
                        fontSize: "0.9375rem",
                        fontFamily: "inherit",
                        outline: "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                      <Clock className="w-4 h-4" style={{ color: "var(--primary, #f36a2a)" }} />
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={formData.due_time}
                      onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.875rem 1rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "12px",
                        background: "#fafafa",
                        color: "#1f2937",
                        fontSize: "0.9375rem",
                        fontFamily: "inherit",
                        outline: "none",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </form>

              {/* Modal Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  padding: "1.25rem 1.75rem",
                  borderTop: "1px solid #f3f4f6",
                  background: "#fafafa",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    background: "#ffffff",
                    color: "#6b7280",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.75rem",
                    border: "none",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--primary, #f36a2a) 0%, var(--primary-dark, #d4551a) 100%)",
                    color: "white",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    boxShadow: "0 4px 14px 0 rgba(243, 106, 42, 0.4)",
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingTask ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingTask ? "Update Task" : "Create Task"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Details Modal */}
      <AnimatePresence>
        {showClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowClientModal(false); setClientDetails(null); }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {clientLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", gap: "0.75rem", color: "#6b7280" }}>
                  <Loader2 className="w-5 h-5" style={{ animation: "spin 1s linear infinite" }} />
                  Loading client details...
                </div>
              ) : clientDetails ? (
                <>
                  {/* Header */}
                  <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)", padding: "1.5rem 2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: "0 0 0.5rem", letterSpacing: "-0.01em" }}>
                        {clientDetails.client_name}
                      </h2>
                      {clientDetails.customer_number && (
                        <a
                          href={`tel:${clientDetails.customer_number}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.9)", fontSize: "0.9375rem", textDecoration: "none", background: "rgba(255,255,255,0.15)", padding: "0.375rem 0.75rem", borderRadius: "8px" }}
                        >
                          <Phone className="w-4 h-4" />
                          {clientDetails.customer_number}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => { setShowClientModal(false); setClientDetails(null); }}
                      style={{ width: "36px", height: "36px", border: "none", background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "1rem 2rem", borderBottom: "1px solid #f3f4f6" }}>
                    {(() => {
                      const lt = LEAD_TYPE_OPTIONS.find(o => o.value === clientDetails.lead_type);
                      return lt ? (
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, background: `${lt.color}20`, color: lt.color }}>{lt.label}</span>
                      ) : null;
                    })()}
                    {(() => {
                      const ls = LEAD_STAGE_OPTIONS.find(o => o.value === clientDetails.lead_stage);
                      return ls ? (
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, background: `${ls.color}20`, color: ls.color }}>{ls.label}</span>
                      ) : null;
                    })()}
                    {(() => {
                      const ds = DEAL_STATUS_OPTIONS.find(o => o.value === clientDetails.deal_status);
                      return ds ? (
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, background: `${ds.color}20`, color: ds.color }}>{ds.label}</span>
                      ) : null;
                    })()}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.5rem 2rem", overflowY: "auto", flex: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.875rem", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ padding: "0.375rem", background: "#fed7aa", borderRadius: "8px", color: "#ea580c" }}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Location</div>
                          <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#1f2937" }}>{clientDetails.location_category || "Not Specified"}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.875rem", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ padding: "0.375rem", background: "#dbeafe", borderRadius: "8px", color: "#2563eb" }}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Expected Visit</div>
                          <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#1f2937" }}>
                            {clientDetails.expected_visit_date
                              ? new Date(clientDetails.expected_visit_date).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
                              : "Not Scheduled"}
                          </div>
                          {clientDetails.expected_visit_time && (
                            <div style={{ fontSize: "0.8125rem", color: "#6366f1", marginTop: "0.125rem" }}>
                              {(() => {
                                const [h, m] = clientDetails.expected_visit_time.split(":");
                                const t = new Date();
                                t.setHours(parseInt(h, 10), parseInt(m, 10));
                                return `at ${t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.875rem", background: "#f9fafb", borderRadius: "12px" }}>
                        <div style={{ padding: "0.375rem", background: "#e9d5ff", borderRadius: "8px", color: "#7c3aed" }}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Added On</div>
                          <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#1f2937" }}>
                            {new Date(clientDetails.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calling History */}
                    {clientDetails.calling_comment_history && clientDetails.calling_comment_history.length > 0 && (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#4338ca", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                          <MessageSquare className="w-4 h-4" />
                          Calling History
                        </div>
                        <div style={{ borderLeft: "2px solid #c7d2fe", paddingLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {clientDetails.calling_comment_history.map((entry, index) => (
                            <div key={index}>
                              <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 500, marginBottom: "0.25rem" }}>
                                {new Date(entry.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                {entry.addedBy && entry.addedBy !== "migrated" && (
                                  <span style={{ color: "#9ca3af", marginLeft: "0.5rem" }}>by {entry.addedBy}</span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{entry.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {clientDetails.admin_notes && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                          <AlertCircle className="w-4 h-4" />
                          Admin Remarks
                        </div>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap", padding: "0.75rem 1rem", background: "#fffbeb", borderRadius: "10px", borderLeft: "3px solid #f59e0b" }}>
                          {clientDetails.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: "1rem 2rem", borderTop: "1px solid #f3f4f6", background: "#fafafa", display: "flex", justifyContent: "space-between" }}>
                    <button
                      onClick={() => { if (clientDetails) openClientEditModal(clientDetails); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.625rem 1.25rem",
                        border: "none",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #f36a2a 0%, #d4551a 100%)",
                        color: "white",
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px 0 rgba(243, 106, 42, 0.3)",
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Client
                    </button>
                    <button
                      onClick={() => { setShowClientModal(false); setClientDetails(null); }}
                      style={{ padding: "0.625rem 1.5rem", border: "2px solid #e5e7eb", borderRadius: "10px", background: "#ffffff", color: "#374151", fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                  <AlertCircle className="w-8 h-8" style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: "0.9375rem" }}>Client not found</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Edit Modal */}
      <AnimatePresence>
        {showClientEditModal && clientDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClientEditModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "520px",
                maxHeight: "90vh",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, var(--primary, #f36a2a) 0%, var(--primary-dark, #d4551a) 100%)",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem", letterSpacing: "-0.01em" }}>
                      Edit Client
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                      {clientDetails.client_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClientEditModal(false)}
                  style={{ width: "36px", height: "36px", border: "none", background: "rgba(255, 255, 255, 0.2)", color: "white", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleClientEditSubmit} style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", flex: 1 }}>
                {/* Lead Stage */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Lead Stage</label>
                  <select value={clientEditData.lead_stage} onChange={(e) => setClientEditData({ ...clientEditData, lead_stage: e.target.value })} style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", background: "#fafafa", color: "#1f2937", fontSize: "0.9375rem" }}>
                    {LEAD_STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Lead Type */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Lead Type</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {LEAD_TYPE_OPTIONS.map((o) => (
                      <label key={o.value} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.75rem 0.5rem", border: `2px solid ${clientEditData.lead_type === o.value ? o.color : "#e5e7eb"}`, borderRadius: "10px", background: clientEditData.lead_type === o.value ? `${o.color}20` : `${o.color}08`, color: clientEditData.lead_type === o.value ? o.color : "#6b7280", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                        <input type="radio" name="admin_edit_lead_type" value={o.value} checked={clientEditData.lead_type === o.value} onChange={(e) => setClientEditData({ ...clientEditData, lead_type: e.target.value })} style={{ display: "none" }} />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: o.color }} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Deal Status */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Deal Status</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {DEAL_STATUS_OPTIONS.map((o) => (
                      <label key={o.value} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.75rem 0.5rem", border: `2px solid ${clientEditData.deal_status === o.value ? o.color : "#e5e7eb"}`, borderRadius: "10px", background: clientEditData.deal_status === o.value ? `${o.color}20` : `${o.color}08`, color: clientEditData.deal_status === o.value ? o.color : "#6b7280", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                        <input type="radio" name="admin_edit_deal_status" value={o.value} checked={clientEditData.deal_status === o.value} onChange={(e) => setClientEditData({ ...clientEditData, deal_status: e.target.value })} style={{ display: "none" }} />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: o.color }} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Location</label>
                  <input type="text" value={clientEditData.location_category} onChange={(e) => setClientEditData({ ...clientEditData, location_category: e.target.value })} placeholder="Location category" style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", background: "#fafafa", color: "#1f2937", fontSize: "0.9375rem", boxSizing: "border-box" as const }} />
                </div>

                {/* Facing */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Facing</label>
                  <input type="text" value={clientEditData.facing} onChange={(e) => setClientEditData({ ...clientEditData, facing: e.target.value })} placeholder="Facing direction" style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", background: "#fafafa", color: "#1f2937", fontSize: "0.9375rem", boxSizing: "border-box" as const }} />
                </div>


                {/* Expected Visit Date & Time */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Expected Visit Date</label>
                    <input type="date" value={clientEditData.expected_visit_date} onChange={(e) => setClientEditData({ ...clientEditData, expected_visit_date: e.target.value })} style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", background: "#fafafa", color: "#1f2937", fontSize: "0.9375rem", boxSizing: "border-box" as const }} />
                  </div>
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Expected Visit Time</label>
                    <input type="time" value={clientEditData.expected_visit_time} onChange={(e) => setClientEditData({ ...clientEditData, expected_visit_time: e.target.value })} style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", background: "#fafafa", color: "#1f2937", fontSize: "0.9375rem", boxSizing: "border-box" as const }} />
                  </div>
                </div>
              </form>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", padding: "1.25rem 1.75rem", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
                <button type="button" onClick={() => setShowClientEditModal(false)} disabled={clientEditSaving} style={{ padding: "0.75rem 1.5rem", border: "2px solid #e5e7eb", borderRadius: "10px", background: "#ffffff", color: "#6b7280", fontSize: "0.9375rem", fontWeight: 600, cursor: clientEditSaving ? "not-allowed" : "pointer", opacity: clientEditSaving ? 0.5 : 1 }}>
                  Cancel
                </button>
                <button type="submit" onClick={handleClientEditSubmit} disabled={clientEditSaving} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.75rem", border: "none", borderRadius: "10px", background: "linear-gradient(135deg, var(--primary, #f36a2a) 0%, var(--primary-dark, #d4551a) 100%)", color: "white", fontSize: "0.9375rem", fontWeight: 600, cursor: clientEditSaving ? "not-allowed" : "pointer", opacity: clientEditSaving ? 0.7 : 1, boxShadow: "0 4px 14px 0 rgba(243, 106, 42, 0.4)" }}>
                  {clientEditSaving ? (
                    <><Loader2 className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: var(--primary);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
