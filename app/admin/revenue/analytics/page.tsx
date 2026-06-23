"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, ArrowLeft } from "lucide-react";
import { motion } from "@/lib/motion";
import Link from "next/link";

interface RevenueEntry {
  id: string;
  type: "earning" | "expense";
  amount: number;
  category: string;
  date: string;
}

const EARNING_COLOR = "#22c55e";
const EXPENSE_COLOR = "#ef4444";
const PROFIT_COLOR = "#3b82f6";

export default function RevenueAnalyticsPage() {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"3m" | "6m" | "1y" | "all">("6m");

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    try {
      const { data } = await supabase
        .from("revenue_entries")
        .select("id, type, amount, category, date")
        .order("date", { ascending: true });
      setEntries(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Filter by range
  const filtered = entries.filter((e) => {
    if (range === "all") return true;
    const months = range === "3m" ? 3 : range === "6m" ? 6 : 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return new Date(e.date) >= cutoff;
  });

  // Summary
  const totalEarnings = filtered.filter((e) => e.type === "earning").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = filtered.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netProfit = totalEarnings - totalExpenses;
  const margin = totalEarnings > 0 ? ((netProfit / totalEarnings) * 100).toFixed(1) : "0.0";

  // Monthly trend data
  const monthlyMap: Record<string, { month: string; earnings: number; expenses: number; profit: number }> = {};
  filtered.forEach((e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!monthlyMap[key]) monthlyMap[key] = { month: label, earnings: 0, expenses: 0, profit: 0 };
    if (e.type === "earning") monthlyMap[key].earnings += e.amount;
    else monthlyMap[key].expenses += e.amount;
    monthlyMap[key].profit = monthlyMap[key].earnings - monthlyMap[key].expenses;
  });
  const monthlyData = Object.values(monthlyMap);

  // Category breakdown
  const categoryMap: Record<string, { name: string; value: number; type: string }> = {};
  filtered.forEach((e) => {
    const key = `${e.type}:${e.category}`;
    if (!categoryMap[key]) categoryMap[key] = { name: e.category, value: 0, type: e.type };
    categoryMap[key].value += e.amount;
  });
  const earningCategories = Object.values(categoryMap).filter((c) => c.type === "earning").sort((a, b) => b.value - a.value);
  const expenseCategories = Object.values(categoryMap).filter((c) => c.type === "expense").sort((a, b) => b.value - a.value);

  const PIE_COLORS = ["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7"];
  const PIE_EXPENSE_COLORS = ["#ef4444", "#dc2626", "#f87171", "#fca5a5", "#fecaca", "#fee2e2"];

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statCards = [
    { label: "Total Earnings", value: totalEarnings, icon: TrendingUp, color: EARNING_COLOR, bg: "#dcfce7" },
    { label: "Total Expenses", value: totalExpenses, icon: TrendingDown, color: EXPENSE_COLOR, bg: "#fee2e2" },
    { label: "Net Profit", value: netProfit, icon: DollarSign, color: PROFIT_COLOR, bg: "#dbeafe" },
    { label: "Profit Margin", value: null, display: `${margin}%`, icon: BarChart2, color: "#8b5cf6", bg: "#ede9fe" },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <motion.div className="admin-page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/admin/revenue"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", background: "#f3f4f6", color: "#374151" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1>Revenue Analytics</h1>
            <p>Financial performance overview</p>
          </div>
        </div>
        {/* Range selector */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {(["3m", "6m", "1y", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={range === r ? "btn-primary" : "btn-secondary"}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}
            >
              {r === "all" ? "All time" : r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="dashboard-stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="dashboard-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              "--stat-gradient": `linear-gradient(135deg, ${s.color} 0%, ${s.color}cc 100%)`,
              "--stat-bg": s.bg,
            } as React.CSSProperties}
          >
            <div className="dashboard-stat-icon"><s.icon className="w-6 h-6" /></div>
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-value" style={{ fontSize: "1rem" }}>
                {s.display ?? fmt(s.value!)}
              </span>
              <span className="dashboard-stat-label">{s.label}</span>
            </div>
            <div className="dashboard-stat-decoration" />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
          No entries in this period. <Link href="/admin/revenue" style={{ color: "#3b82f6" }}>Add entries</Link> to see analytics.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Monthly Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}
          >
            <h2 style={{ marginBottom: "1.25rem", fontWeight: 600, fontSize: "1rem" }}>Monthly Earnings vs Expenses</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => fmt(v as number)} />
                <Legend />
                <Bar dataKey="earnings" name="Earnings" fill={EARNING_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Net Profit Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}
          >
            <h2 style={{ marginBottom: "1.25rem", fontWeight: 600, fontSize: "1rem" }}>Net Profit Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => fmt(v as number)} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke={PROFIT_COLOR}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: PROFIT_COLOR }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}
            >
              <h2 style={{ marginBottom: "1.25rem", fontWeight: 600, fontSize: "1rem" }}>Earnings by Category</h2>
              {earningCategories.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No earnings data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={earningCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {earningCategories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => fmt(v as number)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}
            >
              <h2 style={{ marginBottom: "1.25rem", fontWeight: 600, fontSize: "1rem" }}>Expenses by Category</h2>
              {expenseCategories.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No expenses data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {expenseCategories.map((_, i) => <Cell key={i} fill={PIE_EXPENSE_COLORS[i % PIE_EXPENSE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => fmt(v as number)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

        </div>
      )}
    </div>
  );
}
