"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
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
} from "lucide-react";

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
  completed_at: string | null;
  created_at: string;
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

export default function AdminTasksPage() {
  const { user, session, loading: authLoading } = useAdminAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter state
  const [filterStaff, setFilterStaff] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  });

  useEffect(() => {
    if (!authLoading && session) {
      fetchData();
    }
  }, [authLoading, session]);

  const fetchData = async () => {
    try {
      // Fetch staff members via API (uses service role key)
      const staffResponse = await fetch("/api/admin/staff", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (!staffResponse.ok) {
        console.error("Failed to fetch staff");
        // Don't block task fetching, but maybe set empty staff
      } else {
        const staffResult = await staffResponse.json();
        if (staffResult.staff) {
          setStaff(staffResult.staff);
        }
      }

      // Fetch tasks via API
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

  // Re-fetch when filters change
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
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assigned_to) {
      setError("Title and staff member are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        due_date: formData.due_date || null,
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

  const getPriorityBadge = (priority: string) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    return (
      <span
        className="task-badge"
        style={{ background: `${option?.color}20`, color: option?.color }}
      >
        <Flag className="w-3 h-3" />
        {option?.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    const Icon = option?.icon || Clock;
    return (
      <span
        className="task-badge"
        style={{ background: `${option?.color}20`, color: option?.color }}
      >
        <Icon className="w-3 h-3" />
        {option?.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <Link href="/admin" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1>Staff Tasks</h1>
          <p>Assign and manage tasks for your staff members</p>
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
            className="admin-alert success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && !showModal && (
          <motion.div
            className="admin-alert error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
        <div className="filter-row" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label>Filter by Staff</label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
            >
              <option value="">All Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="admin-section-card">
        {tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: "3rem", textAlign: "center" }}>
            <Clock className="w-12 h-12" style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
            <p style={{ color: "var(--text-secondary)" }}>No tasks found. Create one to get started!</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                className={`task-card ${isOverdue(task) ? "overdue" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <div className="task-card-header">
                  <div className="task-card-title">
                    <h3>{task.title}</h3>
                    <div className="task-badges">
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                      {isOverdue(task) && (
                        <span className="task-badge overdue-badge">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-card-actions">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="status-select"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      className="icon-btn"
                      onClick={() => openEditModal(task)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(task.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                <div className="task-card-meta">
                  <span>
                    <User className="w-4 h-4" />
                    {task.assigned_staff?.name || "Unknown"}
                  </span>
                  <span>
                    <Calendar className="w-4 h-4" />
                    {formatDate(task.due_date)}
                  </span>
                  <span>
                    <Clock className="w-4 h-4" />
                    Created {formatDate(task.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="task-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="task-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Gradient */}
              <div className="task-modal-header">
                <div className="task-modal-header-content">
                  <div className="task-modal-icon">
                    {editingTask ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div className="task-modal-title-area">
                    <h2>{editingTask ? "Edit Task" : "Assign New Task"}</h2>
                    <p>{editingTask ? "Update the task details below" : "Fill in the details to create a new task"}</p>
                  </div>
                </div>
                <button className="task-modal-close" onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="task-modal-form">
                {error && (
                  <motion.div 
                    className="task-form-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                {/* Title Field */}
                <div className="task-form-group">
                  <label className="task-form-label">
                    <Flag className="w-4 h-4" />
                    Task Title
                    <span className="required-star">*</span>
                  </label>
                  <div className="task-input-wrapper">
                    <input
                      type="text"
                      className="task-form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What needs to be done?"
                      required
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="task-form-group">
                  <label className="task-form-label">
                    <Edit2 className="w-4 h-4" />
                    Description
                    <span className="optional-tag">Optional</span>
                  </label>
                  <textarea
                    className="task-form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add detailed instructions or notes..."
                    rows={3}
                  />
                </div>

                {/* Assign To Field */}
                <div className="task-form-group">
                  <label className="task-form-label">
                    <User className="w-4 h-4" />
                    Assign To
                    <span className="required-star">*</span>
                  </label>
                  <div className="task-select-wrapper">
                    <select
                      className="task-form-select"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      required
                    >
                      <option value="">Choose a staff member...</option>
                      {staff.length === 0 && (
                        <option value="" disabled>No active staff members found</option>
                      )}
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} • {s.email}</option>
                      ))}
                    </select>
                    <User className="select-icon w-4 h-4" />
                  </div>
                </div>

                {/* Priority & Due Date Row */}
                <div className="task-form-row">
                  <div className="task-form-group">
                    <label className="task-form-label">
                      <Flag className="w-4 h-4" />
                      Priority Level
                    </label>
                    <div className="priority-options">
                      {PRIORITY_OPTIONS.map((p) => (
                        <label
                          key={p.value}
                          className={`priority-option ${formData.priority === p.value ? "selected" : ""}`}
                          style={{ 
                            "--priority-color": p.color,
                            "--priority-bg": `${p.color}15`,
                            "--priority-bg-selected": `${p.color}25`
                          } as React.CSSProperties}
                        >
                          <input
                            type="radio"
                            name="priority"
                            value={p.value}
                            checked={formData.priority === p.value}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                          />
                          <span className="priority-dot" />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="task-form-group">
                    <label className="task-form-label">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <div className="task-date-wrapper">
                      <input
                        type="date"
                        className="task-form-date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                      <Calendar className="date-icon w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="task-modal-actions">
                  <button
                    type="button"
                    className="task-btn-cancel"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="task-btn-submit"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
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
              </form>
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
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .task-card {
          background: var(--surface-soft);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .task-card:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-sm);
        }
        .task-card.overdue {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.03);
        }
        .task-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .task-card-title h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
          margin: 0 0 0.5rem;
        }
        .task-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .task-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }
        .overdue-badge {
          background: rgba(239, 68, 68, 0.15) !important;
          color: #ef4444 !important;
        }
        .task-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-select {
          padding: 0.375rem 0.75rem;
          font-size: 0.813rem;
          border-radius: var(--radius);
          min-width: 120px;
        }
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: var(--surface-hover);
          color: var(--primary);
        }
        .icon-btn.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }
        .task-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0 0 0.75rem;
          line-height: 1.5;
        }
        .task-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.813rem;
          color: var(--text-muted);
        }
        .task-card-meta span {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .admin-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius);
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .admin-alert.success {
          background: var(--success-light);
          color: #065f46;
        }
        .admin-alert.error {
          background: var(--error-light);
          color: #991b1b;
        }

        /* ========== PREMIUM MODAL STYLES ========== */
        .task-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .task-modal {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        /* Modal Header with Gradient */
        .task-modal-header {
          background: linear-gradient(135deg, var(--primary, #f36a2a) 0%, var(--primary-dark, #d4551a) 100%);
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .task-modal-header-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .task-modal-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .task-modal-title-area h2 {
          font-size: 1.375rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.25rem;
          letter-spacing: -0.01em;
        }

        .task-modal-title-area p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .task-modal-close {
          width: 36px;
          height: 36px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .task-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        /* Modal Form */
        .task-modal-form {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .task-form-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid #fca5a5;
        }

        .task-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .task-form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .task-form-label :global(svg) {
          color: var(--primary, #f36a2a);
        }

        .required-star {
          color: #ef4444;
          font-weight: 700;
        }

        .optional-tag {
          font-size: 0.6875rem;
          font-weight: 500;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 0.125rem 0.5rem;
          border-radius: 100px;
          text-transform: lowercase;
          letter-spacing: 0;
          margin-left: auto;
        }

        .task-input-wrapper {
          position: relative;
        }

        .task-form-input,
        .task-form-textarea,
        .task-form-select,
        .task-form-date {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
          color: #1f2937;
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .task-form-input::placeholder,
        .task-form-textarea::placeholder {
          color: #9ca3af;
        }

        .task-form-input:hover,
        .task-form-textarea:hover,
        .task-form-select:hover,
        .task-form-date:hover {
          border-color: rgba(243, 106, 42, 0.3);
          background: #ffffff;
        }

        .task-form-input:focus,
        .task-form-textarea:focus,
        .task-form-select:focus,
        .task-form-date:focus {
          outline: none;
          border-color: var(--primary, #f36a2a);
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(243, 106, 42, 0.1);
        }

        .task-form-textarea {
          resize: vertical;
          min-height: 100px;
          line-height: 1.6;
        }

        .task-select-wrapper,
        .task-date-wrapper {
          position: relative;
        }

        .task-select-wrapper :global(.select-icon),
        .task-date-wrapper :global(.date-icon) {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .task-form-select {
          appearance: none;
          padding-right: 2.75rem;
          cursor: pointer;
        }

        .task-form-date {
          cursor: pointer;
        }

        /* Priority Options */
        .priority-options {
          display: flex;
          gap: 0.5rem;
        }

        .priority-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: var(--priority-bg);
          color: #6b7280;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .priority-option input {
          display: none;
        }

        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--priority-color);
          transition: transform 0.2s;
        }

        .priority-option:hover {
          border-color: var(--priority-color);
          background: var(--priority-bg);
        }

        .priority-option.selected {
          border-color: var(--priority-color);
          background: var(--priority-bg-selected);
          color: var(--priority-color);
        }

        .priority-option.selected .priority-dot {
          transform: scale(1.25);
          box-shadow: 0 0 0 3px var(--priority-bg);
        }

        /* Form Row */
        .task-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 480px) {
          .task-form-row {
            grid-template-columns: 1fr;
          }
        }

        /* Modal Actions */
        .task-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.25rem 1.75rem;
          border-top: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .task-btn-cancel {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          color: #6b7280;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .task-btn-cancel:hover:not(:disabled) {
          border-color: #d1d5db;
          background: #f9fafb;
          color: #374151;
        }

        .task-btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .task-btn-submit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary, #f36a2a) 0%, var(--primary-dark, #d4551a) 100%);
          color: white;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px 0 rgba(243, 106, 42, 0.4);
        }

        .task-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px 0 rgba(243, 106, 42, 0.5);
        }

        .task-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .task-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
