"use client";

import { useEffect, useState, useRef } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Search,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  X,
  Filter,
  Lock,
  Unlock,
  Phone,
  Calendar,
  MapPin,
  MessageSquare,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
} from "lucide-react";

// Types
interface CRMClient {
  id: string;
  client_name: string;
  customer_number: string | null;
  lead_stage: "follow_up_req" | "dnp" | "disqualified" | "callback_later";
  lead_type: "hot" | "warm" | "cold";
  location_category: string | null;
  calling_comment: string | null;
  expected_visit_date: string | null;
  deal_status: "open" | "locked" | "lost";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

type FilterState = {
  search: string;
  leadStage: string;
  leadType: string;
  dealStatus: string;
  locationCategory: string;
};

const LEAD_STAGE_OPTIONS = [
  { value: "follow_up_req", label: "Follow Up Required", color: "#f59e0b" },
  { value: "dnp", label: "DNP", color: "#6366f1" },
  { value: "disqualified", label: "Disqualified", color: "#ef4444" },
  { value: "callback_later", label: "CB after 2-3 Months", color: "#8b5cf6" },
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

export default function CRMPage() {
  const { user, loading } = useAdminAuth();
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    leadStage: "",
    leadType: "",
    dealStatus: "",
    locationCategory: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingClient, setEditingClient] = useState<CRMClient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // ... (existing state)

  // Handle delete all
  const handleDeleteAll = async () => {
    try {
      // Delete all records where id is not null (effectively all)
      const { error } = await supabase.from("crm_clients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (error) throw error;
      
      setClients([]);
      setShowDeleteAllModal(false);
      alert("All clients have been permanently deleted.");
    } catch (error) {
      console.error("Error deleting all clients:", error);
      alert("Failed to delete clients. Please try again.");
    }
  };



  // Form state
  const [formData, setFormData] = useState({
    client_name: "",
    customer_number: "",
    lead_stage: "follow_up_req" as CRMClient["lead_stage"],
    lead_type: "cold" as CRMClient["lead_type"],
    location_category: "",
    calling_comment: "",
    expected_visit_date: "",
    deal_status: "open" as CRMClient["deal_status"],
    admin_notes: "",
  });

  // Import state
  const [importData, setImportData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(true);

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from("crm_clients")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setClients(data || []);
      } catch (error: any) {
        console.error("Error fetching CRM clients:", error);
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
           // This alert helps the user realize they need to run migrations
           alert("System Configuration Error: The 'crm_clients' database table is missing. Please contact the developer to run the database migration.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchClients();
    }
  }, [user]);

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

  // Reset form
  const resetForm = () => {
    setFormData({
      client_name: "",
      customer_number: "",
      lead_stage: "follow_up_req",
      lead_type: "cold",
      location_category: "",
      calling_comment: "",
      expected_visit_date: "",
      deal_status: "open",
      admin_notes: "",
    });
    setEditingClient(null);
  };

  // Handle add/edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClient) {
        const { error } = await supabase
          .from("crm_clients")
          .update({
            ...formData,
            expected_visit_date: formData.expected_visit_date || null,
          })
          .eq("id", editingClient.id);

        if (error) throw error;

        setClients((prev) =>
          prev.map((c) =>
            c.id === editingClient.id ? { ...c, ...formData, updated_at: new Date().toISOString() } : c
          )
        );
      } else {
        const { data, error } = await supabase
          .from("crm_clients")
          .insert([
            {
              ...formData,
              expected_visit_date: formData.expected_visit_date || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        setClients((prev) => [data, ...prev]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client. Please try again.");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("crm_clients").delete().eq("id", id);
      if (error) throw error;
      setClients((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client. Please try again.");
    }
  };

  // Handle deal status toggle
  const toggleDealStatus = async (client: CRMClient) => {
    const newStatus = client.deal_status === "locked" ? "open" : "locked";
    try {
      const { error } = await supabase
        .from("crm_clients")
        .update({ deal_status: newStatus })
        .eq("id", client.id);

      if (error) throw error;
      setClients((prev) => prev.map((c) => (c.id === client.id ? { ...c, deal_status: newStatus } : c)));
    } catch (error) {
      console.error("Error updating deal status:", error);
    }
  };

  // Robust CSV Parser
  const parseCSV = (text: string) => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++; // Skip escaped quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = "";
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
            currentRow.push(currentCell.trim());
            if (currentRow.length > 0 || currentCell !== "") { // Push non-empty rows
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = "";
        } else {
            currentCell += char;
        }
    }
    // Push last row if exists
    if (currentCell !== "" || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }
    return rows;
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      setImportData(rows);

      // Auto-map columns only if headers exist and first row looks like headers
      if (rows.length > 0 && hasHeaders) {
        const headers = rows[0];
        const mapping: Record<string, string> = {};
        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes("client") && lowerHeader.includes("name")) {
            mapping[index.toString()] = "client_name";
          } else if (lowerHeader.includes("customer") || lowerHeader.includes("number") || lowerHeader.includes("phone")) {
            mapping[index.toString()] = "customer_number";
          } else if (lowerHeader.includes("lead") && lowerHeader.includes("stage")) {
            mapping[index.toString()] = "lead_stage";
          } else if (lowerHeader.includes("comment") || lowerHeader.includes("calling")) {
            mapping[index.toString()] = "calling_comment";
          } else if (lowerHeader.includes("lead") && lowerHeader.includes("type")) {
            mapping[index.toString()] = "lead_type";
          } else if (lowerHeader.includes("location") || lowerHeader.includes("category")) {
            mapping[index.toString()] = "location_category";
          } else if (lowerHeader.includes("date") || lowerHeader.includes("visit")) {
            mapping[index.toString()] = "expected_visit_date";
          }
        });
        setColumnMapping(mapping);
      } else {
        setColumnMapping({});
      }
    };
    reader.readAsText(file);
  };

  // Date parser utility
  const parseDate = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim();
    if (!cleanStr) return null;

    // Try standard Date.parse
    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    
    // Handle DD/MM/YYYY or DD-MM-YYYY common in spreadsheets
    const dmyMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const month = dmyMatch[2].padStart(2, "0");
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    return null; // Return null if invalid to avoid DB error, or could default to today?
  };

  // Handle import submit
  const handleImport = async () => {
    if (importData.length === 0) return;

    setImporting(true);
    try {
      // Determine data rows based on header setting
      const dataRows = hasHeaders ? importData.slice(1) : importData;
      
      const clientsToImport = dataRows.filter((row) => row.some((cell) => cell.trim())).map((row) => {
        const client: Record<string, string | null> = {
          client_name: "",
          customer_number: null,
          lead_stage: "follow_up_req",
          lead_type: "cold",
          location_category: null,
          calling_comment: null,
          expected_visit_date: null,
          deal_status: "open",
          admin_notes: null,
        };

        Object.entries(columnMapping).forEach(([colIndex, fieldName]) => {
          const value = row[parseInt(colIndex)]?.trim() || null;
          if (value) {
            if (fieldName === "lead_stage") {
              const lowerValue = value.toLowerCase();
              if (lowerValue.includes("follow") || lowerValue.includes("req")) {
                client[fieldName] = "follow_up_req";
              } else if (lowerValue.includes("dnp")) {
                client[fieldName] = "dnp";
              } else if (lowerValue.includes("disqualified")) {
                client[fieldName] = "disqualified";
              } else if (lowerValue.includes("cb") || lowerValue.includes("callback") || lowerValue.includes("month")) {
                client[fieldName] = "callback_later";
              }
            } else if (fieldName === "lead_type") {
              const lowerValue = value.toLowerCase();
              if (lowerValue.includes("hot")) {
                client[fieldName] = "hot";
              } else if (lowerValue.includes("warm")) {
                client[fieldName] = "warm";
              } else {
                client[fieldName] = "cold";
              }
            } else if (fieldName === "expected_visit_date") {
              client[fieldName] = parseDate(value);
            } else {
              client[fieldName] = value;
            }
          }
        });

        return client;
      }).filter((c) => c.client_name);

      if (clientsToImport.length === 0) {
        alert("No valid clients found to import. Please ensure Client Name is mapped.");
        setImporting(false);
        return;
      }

      const { data, error } = await supabase.from("crm_clients").insert(clientsToImport).select();

      if (error) {
        console.error("Supabase import error:", error);
        throw error;
      }

      setClients((prev) => [...(data || []), ...prev]);
      setShowImportModal(false);
      setImportData([]);
      setColumnMapping({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert(`Successfully imported ${data?.length || 0} clients!`);
    } catch (error: any) {
      console.error("Error importing clients:", error);
      // Show actual error message to user for better debugging
      alert(`Failed to import clients: ${error?.message || error?.details || "Unknown error"}. Check console for details.`);
    } finally {
      setImporting(false);
    }
  };

  // ... (rest of the file until import UI)

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Client Name",
      "Customer Number",
      "Lead Stage",
      "Lead Type",
      "Location Category",
      "Calling Comment",
      "Expected Visit Date",
      "Deal Status",
      "Admin Notes",
      "Created At",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredClients.map((c) =>
          [
            `"${c.client_name}"`,
            `"${c.customer_number || ""}"`,
            `"${LEAD_STAGE_OPTIONS.find((o) => o.value === c.lead_stage)?.label || c.lead_stage}"`,
            `"${LEAD_TYPE_OPTIONS.find((o) => o.value === c.lead_type)?.label || c.lead_type}"`,
            `"${c.location_category || ""}"`,
            `"${(c.calling_comment || "").replace(/"/g, '""')}"`,
            `"${c.expected_visit_date || ""}"`,
            `"${DEAL_STATUS_OPTIONS.find((o) => o.value === c.deal_status)?.label || c.deal_status}"`,
            `"${(c.admin_notes || "").replace(/"/g, '""')}"`,
            `"${new Date(c.created_at).toLocaleDateString()}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_clients_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (loading || isLoading) {
    return (
      <div className="admin-page">
        <motion.div className="admin-loading-inline" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Loading CRM...
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
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1>CRM</h1>
          <p>Manage your clients and leads</p>
        </div>
        <div className="crm-header-actions">
          <motion.button
            onClick={() => setShowImportModal(true)}
            className="btn-admin-secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </motion.button>
          <motion.button
            onClick={exportToCSV}
            className="btn-admin-secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          <motion.button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-admin-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Add Client</span>
          </motion.button>
          <motion.button
            onClick={() => setShowDeleteAllModal(true)}
            className="btn-admin-danger"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="crm-stats-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="crm-stat-card">
          <div className="crm-stat-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>
            <Users className="w-6 h-6" />
          </div>
          <div className="crm-stat-info">
            <span className="crm-stat-label">Total Clients</span>
            <span className="crm-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="crm-stat-info">
            <span className="crm-stat-label">Hot Leads</span>
            <span className="crm-stat-value">{stats.hot}</span>
          </div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <Clock className="w-6 h-6" />
          </div>
          <div className="crm-stat-info">
            <span className="crm-stat-label">Warm Leads</span>
            <span className="crm-stat-value">{stats.warm}</span>
          </div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="crm-stat-info">
            <span className="crm-stat-label">Deals Locked</span>
            <span className="crm-stat-value">{stats.locked}</span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="crm-filters-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="crm-search-row">
          <div className="admin-search crm-search">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or notes..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <motion.button
            className={`btn-admin-filter ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="crm-filters-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="crm-filter-group">
                <label>Lead Stage</label>
                <select
                  value={filters.leadStage}
                  onChange={(e) => setFilters((prev) => ({ ...prev, leadStage: e.target.value }))}
                >
                  <option value="">All Stages</option>
                  {LEAD_STAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crm-filter-group">
                <label>Lead Type</label>
                <select
                  value={filters.leadType}
                  onChange={(e) => setFilters((prev) => ({ ...prev, leadType: e.target.value }))}
                >
                  <option value="">All Types</option>
                  {LEAD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crm-filter-group">
                <label>Deal Status</label>
                <select
                  value={filters.dealStatus}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dealStatus: e.target.value }))}
                >
                  <option value="">All Status</option>
                  {DEAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crm-filter-group">
                <label>Location</label>
                <select
                  value={filters.locationCategory}
                  onChange={(e) => setFilters((prev) => ({ ...prev, locationCategory: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc || ""}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-admin-text"
                onClick={() =>
                  setFilters({ search: "", leadStage: "", leadType: "", dealStatus: "", locationCategory: "" })
                }
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count */}
      <motion.div
        className="crm-results-count"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Showing {filteredClients.length} of {clients.length} clients
      </motion.div>

      {/* Table/Cards Section */}
      <motion.div
        className="admin-section-card crm-table-section"
        style={{ padding: 0 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Desktop Table */}
        <div className="admin-table-container crm-table-desktop">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Phone</th>
                <th>Lead Stage</th>
                <th>Lead Type</th>
                <th>Location</th>
                <th>Visit Date</th>
                <th>Deal Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.02 }}
                  >
                    <td className="table-property-title">
                      <div className="crm-client-name">
                        <span>{client.client_name}</span>
                        {client.calling_comment && (
                          <span className="crm-comment-preview" title={client.calling_comment}>
                            <MessageSquare className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {client.customer_number && (
                        <a href={`tel:${client.customer_number}`} className="crm-phone-link">
                          <Phone className="w-3 h-3" />
                          {client.customer_number}
                        </a>
                      )}
                    </td>
                    <td>
                      <span className="crm-badge" style={getLeadStageBadge(client.lead_stage)}>
                        {LEAD_STAGE_OPTIONS.find((o) => o.value === client.lead_stage)?.label}
                      </span>
                    </td>
                    <td>
                      <span className="crm-badge" style={getLeadTypeBadge(client.lead_type)}>
                        {LEAD_TYPE_OPTIONS.find((o) => o.value === client.lead_type)?.label}
                      </span>
                    </td>
                    <td>{client.location_category || "-"}</td>
                    <td>
                      {client.expected_visit_date
                        ? new Date(client.expected_visit_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </td>
                    <td>
                      <span className="crm-badge" style={getDealStatusBadge(client.deal_status)}>
                        {DEAL_STATUS_OPTIONS.find((o) => o.value === client.deal_status)?.label}
                      </span>
                    </td>
                    <td>
                      <div className="crm-actions">
                        <button
                          className="crm-action-btn"
                          onClick={() => toggleDealStatus(client)}
                          title={client.deal_status === "locked" ? "Unlock Deal" : "Lock Deal"}
                        >
                          {client.deal_status === "locked" ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="crm-action-btn"
                          onClick={() => {
                            setEditingClient(client);
                            setFormData({
                              client_name: client.client_name,
                              customer_number: client.customer_number || "",
                              lead_stage: client.lead_stage,
                              lead_type: client.lead_type,
                              location_category: client.location_category || "",
                              calling_comment: client.calling_comment || "",
                              expected_visit_date: client.expected_visit_date || "",
                              deal_status: client.deal_status,
                              admin_notes: client.admin_notes || "",
                            });
                            setShowAddModal(true);
                          }}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="crm-action-btn danger"
                          onClick={() => setDeleteConfirm(client.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="empty-state-small">
                    No clients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="crm-cards-mobile">
          {filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                className="crm-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="crm-card-header">
                  <div className="crm-card-name">{client.client_name}</div>
                  <div className="crm-card-badges">
                    <span className="crm-badge" style={getLeadTypeBadge(client.lead_type)}>
                      {LEAD_TYPE_OPTIONS.find((o) => o.value === client.lead_type)?.label}
                    </span>
                    <span className="crm-badge" style={getDealStatusBadge(client.deal_status)}>
                      {client.deal_status === "locked" ? "🔒" : client.deal_status}
                    </span>
                  </div>
                </div>
                <div className="crm-card-details">
                  {client.customer_number && (
                    <a href={`tel:${client.customer_number}`} className="crm-card-detail">
                      <Phone className="w-4 h-4" />
                      <span>{client.customer_number}</span>
                    </a>
                  )}
                  {client.location_category && (
                    <div className="crm-card-detail">
                      <MapPin className="w-4 h-4" />
                      <span>{client.location_category}</span>
                    </div>
                  )}
                  {client.expected_visit_date && (
                    <div className="crm-card-detail">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(client.expected_visit_date).toLocaleDateString("en-IN")}</span>
                    </div>
                  )}
                </div>
                <div className="crm-card-stage">
                  <span className="crm-badge" style={getLeadStageBadge(client.lead_stage)}>
                    {LEAD_STAGE_OPTIONS.find((o) => o.value === client.lead_stage)?.label}
                  </span>
                </div>
                {client.calling_comment && (
                  <div className="crm-card-comment">
                    <MessageSquare className="w-4 h-4" />
                    <span>{client.calling_comment}</span>
                  </div>
                )}
                <div className="crm-card-actions">
                  <button className="crm-action-btn" onClick={() => toggleDealStatus(client)}>
                    {client.deal_status === "locked" ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                  <button
                    className="crm-action-btn"
                    onClick={() => {
                      setEditingClient(client);
                      setFormData({
                        client_name: client.client_name,
                        customer_number: client.customer_number || "",
                        lead_stage: client.lead_stage,
                        lead_type: client.lead_type,
                        location_category: client.location_category || "",
                        calling_comment: client.calling_comment || "",
                        expected_visit_date: client.expected_visit_date || "",
                        deal_status: client.deal_status,
                        admin_notes: client.admin_notes || "",
                      });
                      setShowAddModal(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="crm-action-btn danger" onClick={() => setDeleteConfirm(client.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state-admin">
              <Users className="w-12 h-12" />
              <p>No clients found matching your search.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
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
            >
              <div className="modal-header">
                <h2>{editingClient ? "Edit Client" : "Add New Client"}</h2>
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
              <form onSubmit={handleSubmit} className="crm-form">
                <div className="crm-form-grid">
                  <div className="form-group">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, client_name: e.target.value }))}
                      required
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.customer_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customer_number: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Lead Stage</label>
                    <select
                      value={formData.lead_stage}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lead_stage: e.target.value as CRMClient["lead_stage"] }))
                      }
                    >
                      {LEAD_STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lead Type</label>
                    <select
                      value={formData.lead_type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lead_type: e.target.value as CRMClient["lead_type"] }))
                      }
                    >
                      {LEAD_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location Category</label>
                    <input
                      type="text"
                      value={formData.location_category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location_category: e.target.value }))}
                      placeholder="e.g., West, East"
                    />
                  </div>
                  <div className="form-group">
                    <label>Expected Visit Date</label>
                    <input
                      type="date"
                      value={formData.expected_visit_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expected_visit_date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Deal Status</label>
                    <select
                      value={formData.deal_status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, deal_status: e.target.value as CRMClient["deal_status"] }))
                      }
                    >
                      {DEAL_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Calling Comment / Notes</label>
                  <textarea
                    value={formData.calling_comment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, calling_comment: e.target.value }))}
                    placeholder="Enter notes from calls..."
                    rows={3}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Admin Notes</label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-admin-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-admin-primary">
                    {editingClient ? "Save Changes" : "Add Client"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowImportModal(false);
              setImportData([]);
              setColumnMapping({});
            }}
          >
            <motion.div
              className="modal-content crm-modal crm-import-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Import Clients from CSV</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData([]);
                    setColumnMapping({});
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {importData.length === 0 ? (
                <div className="crm-import-upload">
                  <FileSpreadsheet className="w-16 h-16" />
                  <h3>Upload CSV File</h3>
                  <p>Select a CSV file to import client data</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="crm-file-input"
                  />
                  <button
                    className="btn-admin-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="crm-import-mapping">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Map Columns</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Map your CSV columns to CRM fields. {hasHeaders ? "Using header names from file." : "Using first row as sample data."}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer bg-gray-50 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={hasHeaders}
                        onChange={(e) => {
                          setHasHeaders(e.target.checked);
                          // Clear mapping if status changes as headers might shift
                          setColumnMapping({});
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      First row contains headers
                    </label>
                  </div>

                  <div className="crm-mapping-grid pr-2 custom-scrollbar" style={{ maxHeight: "300px" }}>
                    {(importData[0] || []).map((_, index) => {
                      // Determine label: Header name (if hasHeaders) or "Column X"
                      const headerLabel = hasHeaders ? importData[0][index] : `Column ${index + 1}`;
                      // Determine sample: First data row (row 1 if hasHeaders, row 0 if not)
                      const sampleData = hasHeaders ? (importData[1]?.[index] || "") : importData[0][index];
                      
                      return (
                        <div key={index} className="crm-mapping-row grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-700 truncate" title={headerLabel}>{headerLabel}</span>
                            <span className="text-xs text-gray-500 truncate" title={sampleData}>
                              Sample: {sampleData || "(empty)"}
                            </span>
                          </div>
                          <select
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={columnMapping[index.toString()] || ""}
                            onChange={(e) =>
                              setColumnMapping((prev) => ({ ...prev, [index.toString()]: e.target.value }))
                            }
                            style={{ padding: "8px 12px" }}
                          >
                            <option value="">-- Skip Column --</option>
                            <option value="client_name">Client Name</option>
                            <option value="customer_number">Phone Number</option>
                            <option value="lead_stage">Lead Stage</option>
                            <option value="lead_type">Lead Type</option>
                            <option value="location_category">Location</option>
                            <option value="calling_comment">Calling Comment</option>
                            <option value="expected_visit_date">Expected Visit Date</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div className="crm-import-preview mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                       <FileSpreadsheet className="w-4 h-4" />
                       Data Preview <span className="text-xs font-normal text-gray-500">({hasHeaders ? importData.length - 1 : importData.length} records found)</span>
                    </h4>
                    <div className="crm-preview-table rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {(importData[0] || []).map((_, i) => (
                              <th key={i} className="px-3 py-2 font-medium text-gray-500">
                                {hasHeaders ? importData[0][i] : `Col ${i + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(hasHeaders ? importData.slice(1, 4) : importData.slice(0, 3)).map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2 text-gray-600 truncate max-w-[150px]">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importData.length > 4 && (
                        <div className="bg-gray-50 px-3 py-2 text-center border-t border-gray-200">
                          <p className="text-xs text-gray-500">... and {importData.length - 4} more rows</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="modal-actions pt-4 mt-4 border-t border-gray-100">
                    <button
                      type="button"
                      className="btn-admin-secondary"
                      onClick={() => {
                        setImportData([]);
                        setColumnMapping({});
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Back to Upload
                    </button>
                    <button
                      className="btn-admin-primary"
                      onClick={handleImport}
                      disabled={importing || !Object.values(columnMapping).some(val => val === "client_name")}
                    >
                      {importing ? "Importing..." : `Import Clients`}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
                <h3>Delete Client?</h3>
                <p>This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="btn-admin-secondary" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </button>
                  <button className="btn-admin-danger" onClick={() => handleDelete(deleteConfirm)}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteAllModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content crm-delete-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="crm-delete-content">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3>Delete All Clients?</h3>
                <p>
                  This action cannot be undone. This will permanently delete <strong>{clients.length}</strong> clients from your database.
                </p>
                <div className="flex gap-3 w-full justify-center mt-2">
                  <button
                    className="btn-admin-secondary flex-1"
                    onClick={() => setShowDeleteAllModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-admin-danger flex-1"
                    onClick={handleDeleteAll}
                  >
                    Yes, Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
