"use client";

import { useEffect, useState } from "react";
import { useStaffAuth, supabaseStaff } from "@/lib/staff-auth";
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

  // Filter state
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
        setSuccess("Task marked as completed! 🎉");
        setTimeout(() => setSuccess(""), 3000);
      }

      fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdating(null);
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

  return (
    <div className="staff-tasks-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p>Tasks assigned to you by the admin</p>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="staff-success-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
            <div className="staff-stat-icon" style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
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
          <div className="staff-stat-card" style={{ borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.03)' }}>
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
      <div className="staff-filters-card" style={{ marginBottom: '1rem' }}>
        <div className="staff-form-group" style={{ marginBottom: 0 }}>
          <label className="staff-form-label">Filter by Status</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="staff-filter-select"
            style={{ maxWidth: '200px' }}
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
          <div className="tasks-list">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                className={`task-card ${isOverdue(task) ? "overdue" : ""} ${task.status === "completed" ? "completed" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <div className="task-header">
                  <div className="task-title-section">
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
                  
                  {task.status !== "completed" && (
                    <div className="task-actions">
                      {task.status === "pending" && (
                        <button
                          className="action-btn start"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                          disabled={updating === task.id}
                        >
                          <PlayCircle className="w-4 h-4" />
                          {updating === task.id ? "Updating..." : "Start"}
                        </button>
                      )}
                      <button
                        className="action-btn complete"
                        onClick={() => handleStatusChange(task.id, "completed")}
                        disabled={updating === task.id}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {updating === task.id ? "Updating..." : "Complete"}
                      </button>
                    </div>
                  )}
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  <span>
                    <Calendar className="w-4 h-4" />
                    Due: {formatDate(task.due_date)}
                  </span>
                  {task.assigning_admin && (
                    <span>
                      <User className="w-4 h-4" />
                      Assigned by: {task.assigning_admin.name}
                    </span>
                  )}
                  <span>
                    <Clock className="w-4 h-4" />
                    Created: {formatDate(task.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .staff-tasks-page {
          padding: 0;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--text-secondary, #6b7280);
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .page-header {
          margin-bottom: 1.5rem;
        }
        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem;
        }
        .page-header p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }
        .success-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 0.5rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .stat-card.overdue {
          border: 1px solid #fecaca;
          background: #fef2f2;
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .stat-icon.pending { background: linear-gradient(135deg, #6b7280, #4b5563); }
        .stat-icon.in-progress { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .stat-icon.completed { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .stat-icon.overdue { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .filter-section {
          margin-bottom: 1.5rem;
        }
        .filter-section label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .filter-section select {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          font-size: 0.875rem;
          min-width: 200px;
        }
        .tasks-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 1rem;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #9ca3af;
          text-align: center;
        }
        .empty-state p {
          margin-top: 1rem;
          font-size: 0.938rem;
        }
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .task-card {
          background: #f9fafb;
          border-radius: 0.75rem;
          padding: 1.25rem;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .task-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .task-card.overdue {
          border-color: #fecaca;
          background: #fef2f2;
        }
        .task-card.completed {
          opacity: 0.7;
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .task-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .task-title-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
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
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .overdue-badge {
          background: rgba(239, 68, 68, 0.15) !important;
          color: #ef4444 !important;
        }
        .task-actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.813rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .action-btn.start {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .action-btn.start:hover:not(:disabled) {
          background: #bfdbfe;
        }
        .action-btn.complete {
          background: #22c55e;
          color: white;
        }
        .action-btn.complete:hover:not(:disabled) {
          background: #16a34a;
        }
        .task-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 0.75rem;
          line-height: 1.5;
        }
        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.813rem;
          color: #9ca3af;
        }
        .task-meta span {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
      `}</style>
    </div>
  );
}
