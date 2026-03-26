"use client";

import { useEffect, useState } from "react";
import { useStaffAuth } from "@/lib/staff-auth";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Flag,
  PlayCircle,
  User,
} from "lucide-react";

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

export default function StaffTasksPage() {
  const { staffProfile, session, loading: authLoading } = useStaffAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (!authLoading && session) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session, filterStatus]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);

      const response = await fetch(`/api/staff/tasks?${params.toString()}`, {
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
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdating(taskId);
    try {
      const response = await fetch("/api/staff/tasks", {
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

      if (newStatus === "completed") {
        setSuccess("Task marked as completed!");
        setTimeout(() => setSuccess(""), 3000);
      }

      fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdating(null);
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

  // Stats
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const overdueCount = tasks.filter(isOverdue).length;

  if (authLoading || loading) {
    return (
      <div className="staff-tasks-page">
        <div className="staff-loading">
          <div className="staff-loading-spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!staffProfile) {
    return null;
  }

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.625rem",
    borderRadius: "100px",
    fontSize: "0.75rem",
    fontWeight: 500,
    background: `${color}20`,
    color,
  });

  const renderTaskCard = (task: Task) => {
    const priorityOpt = PRIORITY_OPTIONS.find((p) => p.value === task.priority);
    const statusOpt = STATUS_OPTIONS.find((s) => s.value === task.status);
    const StatusIcon = statusOpt?.icon || Clock;
    const overdue = isOverdue(task);
    const completed = task.status === "completed";

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        style={{
          background: overdue ? "#fef2f2" : completed ? "#f0fdf4" : "#f9fafb",
          borderRadius: "12px",
          padding: "1.25rem",
          border: `1px solid ${overdue ? "#fecaca" : completed ? "#bbf7d0" : "#e5e7eb"}`,
          opacity: completed ? 0.75 : 1,
          transition: "all 0.2s",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: "0 0 0.5rem" }}>{task.title}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={badgeStyle(priorityOpt?.color || "#6b7280")}>
                <Flag className="w-3 h-3" />
                {priorityOpt?.label}
              </span>
              <span style={badgeStyle(statusOpt?.color || "#6b7280")}>
                <StatusIcon className="w-3 h-3" />
                {statusOpt?.label}
              </span>
              {overdue && (
                <span style={badgeStyle("#ef4444")}>
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {!completed && (
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              {task.status === "pending" && (
                <button
                  onClick={() => handleStatusChange(task.id, "in_progress")}
                  disabled={updating === task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "8px",
                    fontSize: "0.813rem",
                    fontWeight: 500,
                    border: "none",
                    cursor: updating === task.id ? "not-allowed" : "pointer",
                    opacity: updating === task.id ? 0.6 : 1,
                    background: "#dbeafe",
                    color: "#1d4ed8",
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  {updating === task.id ? "..." : "Start"}
                </button>
              )}
              <button
                onClick={() => handleStatusChange(task.id, "completed")}
                disabled={updating === task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "8px",
                  fontSize: "0.813rem",
                  fontWeight: 500,
                  border: "none",
                  cursor: updating === task.id ? "not-allowed" : "pointer",
                  opacity: updating === task.id ? 0.6 : 1,
                  background: "#22c55e",
                  color: "white",
                }}
              >
                <CheckCircle className="w-4 h-4" />
                {updating === task.id ? "..." : "Complete"}
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.75rem", lineHeight: 1.5 }}>{task.description}</p>
        )}

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.813rem", color: "#9ca3af" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Calendar className="w-4 h-4" />
            Due: {formatDate(task.due_date, task.due_time)}
          </span>
          {task.assigning_admin && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <User className="w-4 h-4" />
              Assigned by: {task.assigning_admin.name || task.assigning_admin.email}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Clock className="w-4 h-4" />
            Created: {formatDate(task.created_at)}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="staff-tasks-page" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 0.25rem" }}>My Tasks</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>Tasks assigned to you by the admin</p>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1rem",
              background: "#d1fae5",
              color: "#065f46",
              borderRadius: "8px",
              marginBottom: "1.25rem",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="staff-stats-row">
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon" style={{ background: "rgba(107, 114, 128, 0.1)", color: "#6b7280" }}>
              <Clock className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Pending</span>
              <span className="staff-stat-value">{pendingCount}</span>
            </div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon info">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">In Progress</span>
              <span className="staff-stat-value">{inProgressCount}</span>
            </div>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-content">
            <div className="staff-stat-icon success">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="staff-stat-info">
              <span className="staff-stat-label">Completed</span>
              <span className="staff-stat-value">{completedCount}</span>
            </div>
          </div>
        </div>
        {overdueCount > 0 && (
          <div className="staff-stat-card" style={{ borderColor: "var(--error)", background: "rgba(239, 68, 68, 0.03)" }}>
            <div className="staff-stat-content">
              <div className="staff-stat-icon danger">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="staff-stat-info">
                <span className="staff-stat-label">Overdue</span>
                <span className="staff-stat-value">{overdueCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="staff-filters-card" style={{ marginBottom: "1rem" }}>
        <div className="staff-form-group" style={{ marginBottom: 0 }}>
          <label className="staff-form-label">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="staff-filter-select"
            style={{ maxWidth: "200px" }}
          >
            <option value="">All Tasks</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="staff-tasks-container">
        {tasks.length === 0 ? (
          <div className="staff-empty-state">
            <CheckCircle className="w-12 h-12" />
            <p>No tasks found. You&apos;re all caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tasks.map(renderTaskCard)}
          </div>
        )}
      </div>
    </div>
  );
}
