"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import Link from "next/link";

interface RevenueEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

const DEFAULT_TYPES = ["Earning", "Expense", "Refund", "Investment", "Transfer"];
const DEFAULT_CATEGORIES = [
  "Commission", "Consultation Fee", "Rental Income", "Service Fee",
  "Marketing", "Office Rent", "Salaries", "Travel", "Utilities", "Software", "Other",
];

const isEarning = (type: string) => type.toLowerCase() === "earning";
const isExpense = (type: string) => type.toLowerCase() === "expense";

export default function RevenuePage() {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    type: "Earning",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    try {
      const { data, error } = await supabase
        .from("revenue_entries")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setError("Failed to load revenue data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date || !form.type) {
      setError("Type, amount, category, and date are required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { error } = await supabase.from("revenue_entries").insert({
        type: form.type.trim(),
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category.trim(),
        date: form.date,
      });
      if (error) throw error;
      setSuccess("Entry added successfully.");
      setForm({ type: "Earning", amount: "", description: "", category: "", date: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      await fetchEntries();
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setError("Failed to save entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      const { error } = await supabase.from("revenue_entries").delete().eq("id", id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setSuccess("Entry deleted.");
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setError("Failed to delete entry.");
    }
  }

  // Derive unique types and categories from existing entries for datalist
  const existingTypes = Array.from(new Set(entries.map((e) => e.type)));
  const typeOptions = Array.from(new Set([...DEFAULT_TYPES, ...existingTypes]));

  const existingCategories = Array.from(new Set(entries.map((e) => e.category)));
  const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  // Unique types in entries for filter bar
  const filterOptions = ["all", ...Array.from(new Set(entries.map((e) => e.type)))];

  const totalEarnings = entries.filter((e) => isEarning(e.type)).reduce((s, e) => s + e.amount, 0);
  const totalExpenses = entries.filter((e) => isExpense(e.type)).reduce((s, e) => s + e.amount, 0);
  const netProfit = totalEarnings - totalExpenses;

  const filtered = filterType === "all" ? entries : entries.filter((e) => e.type === filterType);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statCards = [
    { label: "Total Earnings", value: totalEarnings, icon: TrendingUp, gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", bgLight: "#dcfce7" },
    { label: "Total Expenses", value: totalExpenses, icon: TrendingDown, gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", bgLight: "#fee2e2" },
    { label: "Net Profit", value: netProfit, icon: DollarSign, gradient: netProfit >= 0 ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", bgLight: netProfit >= 0 ? "#dbeafe" : "#fef3c7" },
  ];

  const typeBadgeStyle = (type: string) => ({
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600 as const,
    background: isEarning(type) ? "#dcfce7" : isExpense(type) ? "#fee2e2" : "#f3f4f6",
    color: isEarning(type) ? "#16a34a" : isExpense(type) ? "#dc2626" : "#374151",
  });

  return (
    <div className="admin-page">
      {/* datalists */}
      <datalist id="type-suggestions">
        {typeOptions.map((t) => <option key={t} value={t} />)}
      </datalist>
      <datalist id="category-suggestions">
        {categoryOptions.map((c) => <option key={c} value={c} />)}
      </datalist>

      <motion.div className="admin-page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>Revenue Tracking</h1>
          <p>Log and monitor earnings and expenses</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/revenue/analytics" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <TrendingUp className="w-4 h-4" /> Analytics
          </Link>
          <motion.button
            className="btn-primary"
            onClick={() => setShowForm((v) => !v)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Entry"}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="dashboard-stats-grid">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="dashboard-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ "--stat-gradient": s.gradient, "--stat-bg": s.bgLight } as React.CSSProperties}
          >
            <div className="dashboard-stat-icon"><s.icon className="w-6 h-6" /></div>
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-value" style={{ fontSize: "1.1rem" }}>{fmt(s.value)}</span>
              <span className="dashboard-stat-label">{s.label}</span>
            </div>
            <div className="dashboard-stat-decoration" />
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "#fee2e2", color: "#dc2626", borderRadius: "0.5rem", marginBottom: "1rem" }}
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", background: "#dcfce7", color: "#16a34a", borderRadius: "0.5rem", marginBottom: "1rem" }}
          >
            <CheckCircle className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "1.5rem" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2 style={{ marginBottom: "1.25rem", fontWeight: 600 }}>New Entry</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Type *</label>
                  <input
                    list="type-suggestions"
                    className="admin-form-input"
                    placeholder="Earning, Expense, or custom..."
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="admin-form-input"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Category *</label>
                  <input
                    list="category-suggestions"
                    className="admin-form-input"
                    placeholder="Pick or type custom category..."
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Date *</label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Optional note..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <Filter className="w-4 h-4" style={{ color: "#6b7280" }} />
        {filterOptions.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={filterType === t ? "btn-primary" : "btn-secondary"}
            style={{ padding: "0.375rem 0.875rem", fontSize: "0.875rem" }}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <DollarSign className="w-10 h-10" style={{ margin: "0 auto 0.75rem" }} />
          <p>No entries yet. Add your first entry.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>{new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td><span style={typeBadgeStyle(entry.type)}>{entry.type}</span></td>
                  <td>{entry.category}</td>
                  <td style={{ color: "#6b7280" }}>{entry.description || "—"}</td>
                  <td style={{ fontWeight: 600, color: isEarning(entry.type) ? "#16a34a" : isExpense(entry.type) ? "#dc2626" : "#374151" }}>
                    {isExpense(entry.type) ? "−" : "+"}{fmt(entry.amount)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="btn-danger"
                      style={{ padding: "0.375rem 0.625rem" }}
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
