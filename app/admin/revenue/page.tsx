"use client";

import { useEffect, useRef, useState } from "react";
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
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/admin/PageHeader";

interface RevenueEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  city?: string;
}

interface CrmClient {
  id: string;
  client_name: string;
  customer_number: string | null;
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "Earning",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    client_name: "",
    client_email: "",
    client_phone: "",
    city: "",
  });

  const [crmClients, setCrmClients] = useState<CrmClient[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showCrmDropdown, setShowCrmDropdown] = useState(false);
  const [clientAutoFilled, setClientAutoFilled] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const phoneDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { fetchEntries(); fetchCrmClients(); fetchCities(); }, []);

  async function fetchCrmClients() {
    const { data } = await supabase
      .from("crm_clients")
      .select("id, client_name, customer_number")
      .order("client_name", { ascending: true });
    if (data) setCrmClients(data);
  }

  async function fetchCities() {
    const { data } = await supabase
      .from("locations")
      .select("city")
      .eq("is_active", true)
      .order("city", { ascending: true });
    if (data) setCities(Array.from(new Set(data.map((l) => l.city))));
  }

  function handlePhoneChange(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, client_phone: cleaned }));
    setClientAutoFilled(false);
    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    if (cleaned.length < 10) return;
    phoneDebounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("crm_clients")
        .select("client_name")
        .eq("customer_number", cleaned)
        .limit(1);
      if (data && data.length > 0) {
        setForm((f) => ({ ...f, client_name: data[0].client_name }));
        setClientAutoFilled(true);
      }
    }, 500);
  }

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
      const payload = {
        type: form.type.trim(),
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category.trim(),
        date: form.date,
        client_name: form.client_name.trim() || null,
        client_email: form.client_email.trim() || null,
        client_phone: form.client_phone.trim() || null,
        city: form.city.trim() || null,
      };
      if (editingId) {
        const { error } = await supabase
          .from("revenue_entries")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        setSuccess("Entry updated successfully.");
      } else {
        const { error } = await supabase.from("revenue_entries").insert(payload);
        if (error) throw error;
        setSuccess("Entry added successfully.");
      }
      setForm({ type: "Earning", amount: "", description: "", category: "", date: new Date().toISOString().split("T")[0], client_name: "", client_email: "", client_phone: "", city: "" }); setClientAutoFilled(false);
      setEditingId(null);
      setShowForm(false);
      await fetchEntries();
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setError("Failed to save entry.");
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit(entry: RevenueEntry) {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      amount: entry.amount.toString(),
      description: entry.description || "",
      category: entry.category,
      date: entry.date,
      client_name: entry.client_name || "",
      client_email: entry.client_email || "",
      client_phone: entry.client_phone || "",
      city: entry.city || "",
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function handleDelete(id: string) {
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

  const existingCities = Array.from(new Set(entries.map((e) => e.city).filter(Boolean))) as string[];
  const cityOptions = Array.from(new Set([...cities, ...existingCities]));

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
    background: isEarning(type) ? "#dcfce7" : isExpense(type) ? "#fee2e2" : "var(--color-gray-100)",
    color: isEarning(type) ? "#16a34a" : isExpense(type) ? "#dc2626" : "var(--color-gray-700)",
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
      <datalist id="city-suggestions">
        {cityOptions.map((c) => <option key={c} value={c} />)}
      </datalist>

      <PageHeader
        eyebrow="Money"
        title="Revenue"
        description="Log and track earnings and expenses."
        actions={
          <>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="outline" render={<Link href="/admin/revenue/analytics" />}>
                <TrendingUp className="w-4 h-4" /> Analytics
              </Button>
              <Button
                onClick={() => {
                  if (showForm) {
                    setForm({ type: "Earning", amount: "", description: "", category: "", date: new Date().toISOString().split("T")[0], client_name: "", client_email: "", client_phone: "", city: "" }); setClientAutoFilled(false);
                    setEditingId(null);
                    setShowForm(false);
                  } else {
                    setShowForm(true);
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                {showForm ? "Cancel" : "Add Entry"}
              </Button>
            </div>
          </>
        }
      />

      {/* Stats */}
      <div className="dashboard-stats-grid">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ "--stat-gradient": s.gradient, "--stat-bg": s.bgLight } as React.CSSProperties}
          >
            <Card className="dashboard-stat-card">
              <CardContent className="dashboard-stat-icon"><s.icon className="w-6 h-6" /></CardContent>
              <CardContent className="dashboard-stat-info">
                <span className="dashboard-stat-value" style={{ fontSize: "1.1rem" }}>{fmt(s.value)}</span>
                <span className="dashboard-stat-label">{s.label}</span>
              </CardContent>
              <div className="dashboard-stat-decoration" />
            </Card>
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
            ref={formRef}
            style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid var(--color-gray-200)", overflow: "hidden", marginBottom: "1.5rem" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2 style={{ marginBottom: "1.25rem", fontWeight: 600 }}>{editingId ? "Edit Entry" : "New Entry"}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <Label className="admin-form-label">Type *</Label>
                  <Input
                    list="type-suggestions"
                    className="admin-form-input"
                    placeholder="Earning, Expense, or custom..."
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Amount (₹) *</Label>
                  <Input
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
                  <Label className="admin-form-label">Category *</Label>
                  <Input
                    list="category-suggestions"
                    className="admin-form-input"
                    placeholder="Pick or type custom category..."
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Date *</Label>
                  <Input
                    type="date"
                    className="admin-form-input"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <Label className="admin-form-label">City</Label>
                  <Input
                    list="city-suggestions"
                    className="admin-form-input"
                    placeholder="Pick or type city..."
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
              </div>
              {/* Client Details */}
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ position: "relative" }}>
                  <Label className="admin-form-label">
                    Client Name
                    {clientAutoFilled && (
                      <Badge style={{ marginLeft: "0.5rem", background: "#dcfce7", color: "#16a34a" }}>
                        Auto-detected
                      </Badge>
                    )}
                  </Label>
                  <Input
                    type="text"
                    className="admin-form-input"
                    placeholder="Type to search CRM or enter custom name..."
                    value={form.client_name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, client_name: e.target.value }));
                      setShowCrmDropdown(true);
                      setClientAutoFilled(false);
                    }}
                    onFocus={() => setShowCrmDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCrmDropdown(false), 150)}
                    autoComplete="off"
                  />
                  {showCrmDropdown && form.client_name && (() => {
                    const matches = crmClients.filter((c) =>
                      c.client_name.toLowerCase().includes(form.client_name.toLowerCase())
                    ).slice(0, 10);
                    return matches.length > 0 ? (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                        background: "#fff", border: "1px solid var(--color-gray-200)", borderRadius: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: "200px", overflowY: "auto",
                      }}>
                        {matches.map((c) => (
                          <div
                            key={c.id}
                            style={{ padding: "0.625rem 1rem", cursor: "pointer", borderBottom: "1px solid var(--color-gray-100)" }}
                            onMouseDown={() => {
                              setForm((f) => ({ ...f, client_name: c.client_name, client_phone: c.customer_number || f.client_phone }));
                              setShowCrmDropdown(false);
                              setClientAutoFilled(false);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-gray-50)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{c.client_name}</div>
                            {c.customer_number && <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>{c.customer_number}</div>}
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                    Select from CRM to autofill details, or enter a custom client name.
                  </p>
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Client Phone</Label>
                  <Input
                    type="tel"
                    className="admin-form-input"
                    placeholder="10-digit number..."
                    value={form.client_phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                  />
                  {form.client_phone.length > 0 && form.client_phone.length < 10 && (
                    <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                      {10 - form.client_phone.length} more digit{10 - form.client_phone.length !== 1 ? "s" : ""} to auto-detect client
                    </p>
                  )}
                </div>
              </div>
              <div className="admin-form-group">
                <Label className="admin-form-label">Client Email</Label>
                <Input
                  type="email"
                  className="admin-form-input"
                  placeholder="client@email.com"
                  value={form.client_email}
                  onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
                />
              </div>

              <div className="admin-form-group">
                <Label className="admin-form-label">Description</Label>
                <Textarea
                  className="admin-form-input"
                  placeholder="Optional note..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  style={{ resize: "vertical", lineHeight: "1.5" }}
                />
              </div>
              <div className="admin-form-actions" style={{ display: "flex", gap: "0.5rem" }}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm({ type: "Earning", amount: "", description: "", category: "", date: new Date().toISOString().split("T")[0], client_name: "", client_email: "", client_phone: "", city: "" }); setClientAutoFilled(false);
                      setEditingId(null);
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <Filter className="w-4 h-4" style={{ color: "var(--color-gray-500)" }} />
        {filterOptions.map((t) => (
          <Button
            key={t}
            onClick={() => setFilterType(t)}
            variant={filterType === t ? "default" : "outline"}
            style={{ padding: "0.375rem 0.875rem", fontSize: "0.875rem" }}
          >
            {t === "all" ? "All" : t}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3" style={{ padding: "1rem 0" }}>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-gray-500)" }}>
          <DollarSign className="w-10 h-10" style={{ margin: "0 auto 0.75rem" }} />
          <p>No entries yet. Add your first entry.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-slot="table-row" className="border-b transition-colors hover:bg-muted/50">
                  <TableCell>{new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell>
                    <Badge style={{ background: isEarning(entry.type) ? "#dcfce7" : isExpense(entry.type) ? "#fee2e2" : "var(--color-gray-100)", color: isEarning(entry.type) ? "#16a34a" : isExpense(entry.type) ? "#dc2626" : "var(--color-gray-700)" }}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{entry.city || "—"}</TableCell>
                  <TableCell>
                    {entry.client_name ? (
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{entry.client_name}</div>
                        {entry.client_phone && <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>{entry.client_phone}</div>}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell style={{ color: "var(--color-gray-500)", whiteSpace: "pre-wrap", maxWidth: "200px" }}>{entry.description || "—"}</TableCell>
                  <TableCell style={{ fontWeight: 600, color: isEarning(entry.type) ? "#16a34a" : isExpense(entry.type) ? "#dc2626" : "var(--color-gray-700)" }}>
                    {isExpense(entry.type) ? "−" : "+"}{fmt(entry.amount)}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button
                        onClick={() => handleStartEdit(entry)}
                        variant="outline"
                        size="icon"
                        title="Edit entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="destructive" size="icon" title="Delete entry" />}>
                          <Trash2 className="w-4 h-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the revenue entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
