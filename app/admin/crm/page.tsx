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
  MoreVertical,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import Link from "next/link";

// Types
interface CRMSheet {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

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
  sheet_id: string | null;
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

const ITEMS_PER_PAGE = 100;

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
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Sheet management state
  const [sheets, setSheets] = useState<CRMSheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [importSheetName, setImportSheetName] = useState("");
  const [importToExistingSheet, setImportToExistingSheet] = useState<string | null>(null);
  const [showSheetMenu, setShowSheetMenu] = useState<string | null>(null);
  const [deleteSheetConfirm, setDeleteSheetConfirm] = useState<string | null>(null);

  // Excel Import State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [availableExcelSheets, setAvailableExcelSheets] = useState<string[]>([]);
  const [selectedExcelSheet, setSelectedExcelSheet] = useState<string>("");
  const workbookRef = useRef<XLSX.WorkBook | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

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

  // Handle delete sheet
  const handleDeleteSheet = async (sheetId: string) => {
    try {
      // First delete all clients in this sheet
      const { error: clientsError } = await supabase
        .from("crm_clients")
        .delete()
        .eq("sheet_id", sheetId);

      if (clientsError) throw clientsError;

      // Then delete the sheet itself
      const { error: sheetError } = await supabase
        .from("crm_sheets")
        .delete()
        .eq("id", sheetId);

      if (sheetError) throw sheetError;

      // Update local state
      setSheets(prev => prev.filter(s => s.id !== sheetId));
      setClients(prev => prev.filter(c => c.sheet_id !== sheetId));
      
      // If this was the selected sheet, go back to all clients
      if (selectedSheetId === sheetId) {
        setSelectedSheetId(null);
      }
      
      setDeleteSheetConfirm(null);
      alert("Sheet and all its clients have been deleted.");
    } catch (error) {
      console.error("Error deleting sheet:", error);
      alert("Failed to delete sheet. Please try again.");
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
    sheet_id: "",
  });

  // Import state
  const [importData, setImportData] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(true);
  
  // Custom columns state
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [newCustomColumn, setNewCustomColumn] = useState("");

  // Add custom column handler
  const handleAddCustomColumn = () => {
    const trimmed = newCustomColumn.trim();
    if (trimmed && !customColumns.includes(trimmed)) {
      setCustomColumns(prev => [...prev, trimmed]);
      setNewCustomColumn("");
    }
  };

  // Remove custom column handler
  const handleRemoveCustomColumn = (columnName: string) => {
    setCustomColumns(prev => prev.filter(c => c !== columnName));
    // Also remove from mapping if used
    setColumnMapping(prev => {
      const newMapping = { ...prev };
      Object.entries(newMapping).forEach(([key, value]) => {
        if (value === `custom_${columnName}`) {
          delete newMapping[key];
        }
      });
      return newMapping;
    });
  };

  // Auto-map remaining columns as custom columns
  const handleAutoMapCustomColumns = () => {
    if (!importData.length) return;
    
    // Get headers (either firt row or column indices)
    const headers = hasHeaders ? importData[0] : importData[0].map((_, i) => `Column ${i + 1}`);
    
    const newCustomCols: string[] = [];
    const newMapping = { ...columnMapping };
    
    headers.forEach((header, index) => {
      // If column is note mapped yet
      if (!newMapping[index.toString()]) {
        const cleanHeader = header.trim();
        if (cleanHeader) {
          // Add to custom columns list if not exists
          if (!customColumns.includes(cleanHeader) && !newCustomCols.includes(cleanHeader)) {
            newCustomCols.push(cleanHeader);
          }
          // Map it
          newMapping[index.toString()] = `custom_${cleanHeader}`;
        }
      }
    });

    if (newCustomCols.length > 0) {
      setCustomColumns(prev => [...prev, ...newCustomCols]);
    }
    setColumnMapping(newMapping);
  };

  // Fetch sheets
  useEffect(() => {
    async function fetchSheets() {
      try {
        const { data, error } = await supabase
          .from("crm_sheets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching sheets:", error);
          // If table doesn't exist, continue without sheets
          return;
        }
        setSheets(data || []);
      } catch (error) {
        console.error("Error fetching sheets:", error);
      }
    }

    if (user) {
      fetchSheets();
    }
  }, [user]);

  // Fetch clients (filtered by selected sheet if any)
  useEffect(() => {
    async function fetchClients() {
      try {
        let query = supabase
          .from("crm_clients")
          .select("*")
          .order("created_at", { ascending: false });

        // Filter by selected sheet if not "all"
        if (selectedSheetId && selectedSheetId !== "all") {
          query = query.eq("sheet_id", selectedSheetId);
        }

        // Increase limit to 10,000 records to fix the 1000 limit issue
        const { data, error } = await query.range(0, 9999);

        if (error) throw error;
        setClients(data || []);
      } catch (error: any) {
        console.error("Error fetching CRM clients:", error);
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
           alert("System Configuration Error: The 'crm_clients' database table is missing. Please contact the developer to run the database migration.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchClients();
    }
  }, [user, selectedSheetId]);

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

  // Pagination Logic
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page depends on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedSheetId]);

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
      sheet_id: selectedSheetId && selectedSheetId !== "all" ? selectedSheetId : (sheets.length > 0 ? sheets[0].id : ""),
    });
    setEditingClient(null);
  };

  // Handle add/edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check for duplicates (only if phone number is provided)
      if (formData.customer_number && formData.customer_number.trim()) {
        const normalizedPhone = formData.customer_number.trim().replace(/\s+/g, "");
        
        const duplicate = clients.find(c => {
          // If editing, skip self
          if (editingClient && c.id === editingClient.id) return false;
          
          const existingPhone = c.customer_number?.trim().replace(/\s+/g, "");
          return existingPhone === normalizedPhone;
        });

        if (duplicate) {
          alert(`A client with phone number "${formData.customer_number}" already exists (${duplicate.client_name}).`);
          return;
        }
      }

      if (editingClient) {
        const { error } = await supabase
          .from("crm_clients")
          .update({
            ...formData,
            expected_visit_date: formData.expected_visit_date || null,
            sheet_id: formData.sheet_id || null, // Ensure sheet_id is updated
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
              sheet_id: formData.sheet_id || (selectedSheetId && selectedSheetId !== "all" ? selectedSheetId : null),
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

  
  const handleExcelSheetChange = (sheetName: string, wb: XLSX.WorkBook | null = workbookRef.current) => {
    if (!wb) return;
    setSelectedExcelSheet(sheetName);
    const worksheet = wb.Sheets[sheetName];
    // Use raw: false to get formatted strings (dates as text)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false }) as string[][];
    
    // Ensure all cells are strings for compatibility
    const stringData = jsonData.map(row => row.map(cell => {
         if (cell === null || cell === undefined) return "";
         return String(cell);
    }));
    
    handleDataLoaded(stringData);
  };

  const handleDataLoaded = (rows: string[][]) => {
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

  // Handle CSV/Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setImportSheetName(fileName);
    setImportToExistingSheet(null);
    setAvailableExcelSheets([]);
    setSelectedExcelSheet("");
    workbookRef.current = null;

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
       const reader = new FileReader();
       reader.onload = (event) => {
         const data = event.target?.result;
         try {
           const workbook = XLSX.read(data, { type: "binary" });
           workbookRef.current = workbook;
           const sheetNames = workbook.SheetNames;
           setAvailableExcelSheets(sheetNames);
           
           if (sheetNames.length > 0) {
             handleExcelSheetChange(sheetNames[0], workbook);
           }
         } catch (error) {
           console.error("Error reading Excel file:", error);
           alert("Failed to read Excel file. Please try saving as CSV.");
         }
       };
       reader.readAsBinaryString(file);
    } else {
       // CSV
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const rows = parseCSV(text);
          handleDataLoaded(rows);
        };
        reader.readAsText(file);
    }
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

    // Validate sheet selection
    if (!importSheetName.trim() && !importToExistingSheet) {
      alert("Please enter a sheet name or select an existing sheet.");
      return;
    }

    setImporting(true);
    try {
      let targetSheetId: string;

      // Create new sheet or use existing
      if (importToExistingSheet) {
        targetSheetId = importToExistingSheet;
      } else {
        // Create new sheet
        const { data: newSheet, error: sheetError } = await supabase
          .from("crm_sheets")
          .insert([{ name: importSheetName.trim(), description: `Imported on ${new Date().toLocaleDateString()}` }])
          .select()
          .single();

        if (sheetError) {
          if (sheetError.code === "23505") {
            alert("A sheet with this name already exists. Please choose a different name or select the existing sheet.");
            setImporting(false);
            return;
          }
          throw sheetError;
        }

        targetSheetId = newSheet.id;
        setSheets(prev => [newSheet, ...prev]);
      }

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
          sheet_id: targetSheetId,
        };

        // Collect custom column data
        const customData: Record<string, string> = {};

        Object.entries(columnMapping).forEach(([colIndex, fieldName]) => {
          const value = row[parseInt(colIndex)]?.trim() || null;
          if (value) {
            // Handle custom columns
            if (fieldName.startsWith("custom_")) {
              const customColName = fieldName.replace("custom_", "");
              customData[customColName] = value;
            } else if (fieldName === "lead_stage") {
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

        // Append custom columns to admin_notes
        if (Object.keys(customData).length > 0) {
          const customNotesSection = Object.entries(customData)
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");
          client.admin_notes = client.admin_notes 
            ? `${client.admin_notes}\n\n--- Custom Fields ---\n${customNotesSection}`
            : `--- Custom Fields ---\n${customNotesSection}`;
        }

        return client;
      }).filter((c) => c.client_name);

      if (clientsToImport.length === 0) {
        alert("No valid clients found to import. Please ensure Client Name is mapped.");
        setImporting(false);
        return;
      }

      // Filter out duplicates based on phone number
      const existingPhoneNumbers = new Set(
        clients
          .map(c => c.customer_number?.trim().replace(/\s+/g, ""))
          .filter(Boolean)
      );

      // distinct within the file
      const phoneSeenInFile = new Set<string>();
      const distinctClientsInFile = clientsToImport.filter(c => {
         if (!c.customer_number) return true;
         const normalizedPhone = c.customer_number.trim().replace(/\s+/g, "");
         if (phoneSeenInFile.has(normalizedPhone)) return false;
         phoneSeenInFile.add(normalizedPhone);
         return true;
      });

      const uniqueClientsToImport = distinctClientsInFile.filter(c => {
        if (!c.customer_number) return true;
        const normalizedPhone = c.customer_number.trim().replace(/\s+/g, "");
        return !existingPhoneNumbers.has(normalizedPhone);
      });

      const duplicateCount = clientsToImport.length - uniqueClientsToImport.length;

      if (uniqueClientsToImport.length === 0) {
        alert(`All ${clientsToImport.length} clients were skipped as duplicates (phone numbers already exist).`);
        setImporting(false);
        return;
      }

      const { data, error } = await supabase.from("crm_clients").insert(uniqueClientsToImport).select();

      if (error) {
        console.error("Supabase import error:", error);
        throw error;
      }

      // Switch to the imported sheet
      setSelectedSheetId(targetSheetId);
      setShowImportModal(false);
      setImportData([]);
      setColumnMapping({});
      setImportSheetName("");
      setImportToExistingSheet(null);
      setCustomColumns([]);
      setNewCustomColumn("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert(`Successfully imported ${data?.length || 0} clients to "${importToExistingSheet ? sheets.find(s => s.id === importToExistingSheet)?.name : importSheetName}"! ${duplicateCount > 0 ? `(${duplicateCount} duplicates skipped)` : ""}`);
    } catch (error: any) {
      console.error("Error importing clients:", error);
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
          <Link href="/admin/crm/staff" className="btn-admin-secondary">
            <UserCog className="w-4 h-4" />
            <span>Staff Access</span>
          </Link>
        </div>
      </motion.div>

      {/* Sheet Tabs */}
      {sheets.length > 0 && (
        <motion.div
          className="crm-sheet-tabs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <button
            onClick={() => setSelectedSheetId(null)}
            className={`crm-sheet-tab ${!selectedSheetId ? 'active' : ''}`}
          >
            <Users className="w-4 h-4" />
            All Clients
          </button>
          {sheets.map((sheet) => (
            <div key={sheet.id} className="crm-sheet-tab-wrapper">
              <button
                onClick={() => setSelectedSheetId(sheet.id)}
                className={`crm-sheet-tab ${selectedSheetId === sheet.id ? 'active' : ''}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                {sheet.name}
              </button>
              <button
                className="crm-sheet-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteSheetConfirm(sheet.id);
                }}
                title="Delete sheet"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

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
          <table className="admin-table table-fixed w-full">
            <thead>
              <tr>
                <th className="w-[25%]">Client Name</th>
                <th className="w-[12%]">Phone</th>
                <th className="w-[15%]">Lead Stage</th>
                <th className="w-[8%]">Lead Type</th>
                <th className="w-[10%]">Location</th>
                <th className="w-[10%]">Visit Date</th>
                <th className="w-[10%]">Deal Status</th>
                <th className="w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence mode="popLayout">
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowDetailsModal(true);
                      }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="table-property-title max-w-0">
                        <div className="crm-client-name cursor-pointer hover:text-indigo-600 transition-colors truncate block w-full">
                          <span className="truncate">{client.client_name}</span>
                        </div>
                      </td>
                      <td>
                        {client.customer_number && (
                          <a href={`tel:${client.customer_number}`} className="crm-phone-link" onClick={(e) => e.stopPropagation()}>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDealStatus(client);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
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
                                sheet_id: client.sheet_id || "",
                              });
                              setShowAddModal(true);
                            }}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="crm-action-btn danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(client.id);
                            }}
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
              </AnimatePresence>
            </tbody>
          </table>
        </div>

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
                        sheet_id: client.sheet_id || "",
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
                  <div className="form-group full-width">
                    <label>Table (Sheet)</label>
                    <select
                      value={formData.sheet_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sheet_id: e.target.value }))}
                      required
                    >
                      <option value="" disabled>Select a table...</option>
                      {sheets.map((sheet) => (
                        <option key={sheet.id} value={sheet.id}>
                          {sheet.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
              setCustomColumns([]);
              setNewCustomColumn("");
            }}
          >
            <motion.div
              className="modal-content crm-modal crm-import-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Step Indicators */}
              <div className="import-steps">
                <div className={`import-step ${importData.length === 0 ? 'active' : 'completed'}`}>
                  <span className="import-step-number">
                    {importData.length > 0 ? '✓' : '1'}
                  </span>
                  <span>Upload</span>
                </div>
                <div className={`import-step-connector ${importData.length > 0 ? 'completed' : ''}`} />
                <div className={`import-step ${importData.length > 0 ? 'active' : ''}`}>
                  <span className="import-step-number">2</span>
                  <span>Configure</span>
                </div>
                <div className="import-step-connector" />
                <div className="import-step">
                  <span className="import-step-number">3</span>
                  <span>Import</span>
                </div>
              </div>

              {importData.length === 0 ? (
                /* Upload Step */
                <div 
                  className="import-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="import-dropzone">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      CSV, XLSX, XLS
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="import-file-info">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {excelFile?.name || "Imported File"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {importData.length} rows • {Object.keys(columnMapping).length} columns mapped
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setImportData([]);
                        setColumnMapping({});
                        setExcelFile(null);
                        setAvailableExcelSheets([]);
                        setSelectedExcelSheet("");
                        workbookRef.current = null;
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Excel Sheet Selection */}
                  {availableExcelSheets.length > 1 && (
                    <div className="excel-sheet-selector mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Sheet
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableExcelSheets.map(sheet => (
                          <button
                            key={sheet}
                            onClick={() => handleExcelSheetChange(sheet)}
                            className={`px-3 py-1.5 text-sm rounded-md border flex items-center gap-2 ${
                              selectedExcelSheet === sheet
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <Sheet className="w-4 h-4" />
                            {sheet}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sheet Selection */}
                  <div className="import-sheet-section">
                    <div className="import-section-header">
                      <div className="import-section-icon">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="import-section-title">Import to Sheet</span>
                    </div>
                    <div className="import-sheet-options">
                      <div 
                        className={`import-sheet-option ${!importToExistingSheet ? 'selected' : ''}`}
                        onClick={() => setImportToExistingSheet(null)}
                      >
                        <div className="import-sheet-radio" />
                        <div className="import-sheet-content">
                          <div className="import-sheet-label">Create New Sheet</div>
                          <input
                            type="text"
                            className="import-sheet-input"
                            placeholder="e.g., January 2026 Leads"
                            value={importSheetName}
                            onChange={(e) => {
                              setImportSheetName(e.target.value);
                              setImportToExistingSheet(null);
                            }}
                            disabled={!!importToExistingSheet}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      {sheets.length > 0 && (
                        <div 
                          className={`import-sheet-option ${importToExistingSheet ? 'selected' : ''}`}
                          onClick={() => setImportToExistingSheet(sheets[0]?.id || null)}
                        >
                          <div className="import-sheet-radio" />
                          <div className="import-sheet-content">
                            <div className="import-sheet-label">Add to Existing Sheet</div>
                            <select
                              className="import-sheet-select"
                              value={importToExistingSheet || ""}
                              onChange={(e) => {
                                setImportToExistingSheet(e.target.value || null);
                                if (e.target.value) setImportSheetName("");
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Select a sheet...</option>
                              {sheets.map((sheet) => (
                                <option key={sheet.id} value={sheet.id}>
                                  {sheet.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column Mapping Section */}
                  <div className="import-mapping-section">
                    <div className="import-mapping-header">
                      <div className="import-mapping-info">
                        <h3>Map Columns</h3>
                        <p>Map your CSV columns to CRM fields. {hasHeaders ? "Using header names from file." : "Using first row as sample data."}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="import-header-toggle hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                          onClick={handleAutoMapCustomColumns}
                          title="Automatically map unmapped columns as custom fields"
                        >
                          <span className="flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Auto-Map As-Is
                          </span>
                        </button>
                        <label className="import-header-toggle">
                          <input
                            type="checkbox"
                            checked={hasHeaders}
                            onChange={(e) => {
                              setHasHeaders(e.target.checked);
                              setColumnMapping({});
                            }}
                          />
                          First row contains headers
                        </label>
                      </div>
                    </div>

                    {/* Column Cards */}
                    <div className="import-column-cards">
                      {(importData[0] || []).map((_, index) => {
                        const headerLabel = hasHeaders ? importData[0][index] : `Column ${index + 1}`;
                        const sampleData = hasHeaders ? (importData[1]?.[index] || "") : importData[0][index];
                        const mappedValue = columnMapping[index.toString()] || "";
                        const cardClass = mappedValue 
                          ? mappedValue.startsWith('custom_') 
                            ? 'custom' 
                            : 'mapped'
                          : 'skipped';
                        
                        return (
                          <div key={index} className={`import-column-card ${cardClass}`}>
                            <div className="import-column-source">
                              <span className="import-column-name" title={headerLabel}>{headerLabel}</span>
                              <span className="import-column-sample">
                                Sample: <span>{sampleData || "(empty)"}</span>
                              </span>
                            </div>
                            <div className="import-column-target">
                              <select
                                value={mappedValue}
                                onChange={(e) =>
                                  setColumnMapping((prev) => ({ ...prev, [index.toString()]: e.target.value }))
                                }
                              >
                                <option value="">-- Skip Column --</option>
                                <optgroup label="CRM Fields">
                                  <option value="client_name">Client Name *</option>
                                  <option value="customer_number">Phone Number</option>
                                  <option value="lead_stage">Lead Stage</option>
                                  <option value="lead_type">Lead Type</option>
                                  <option value="location_category">Location</option>
                                  <option value="calling_comment">Calling Comment</option>
                                  <option value="expected_visit_date">Expected Visit Date</option>
                                </optgroup>
                                {customColumns.length > 0 && (
                                  <optgroup label="Custom Columns">
                                    {customColumns.map((col) => (
                                      <option key={col} value={`custom_${col}`}>
                                        📝 {col}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Column Creation */}
                    <div className="import-custom-column">
                      <input
                        type="text"
                        placeholder="Add a custom column name..."
                        value={newCustomColumn}
                        onChange={(e) => setNewCustomColumn(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomColumn();
                          }
                        }}
                      />
                      <button
                        className="import-add-custom-btn"
                        onClick={handleAddCustomColumn}
                        disabled={!newCustomColumn.trim()}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>

                    {/* Custom Columns List */}
                    {customColumns.length > 0 && (
                      <div className="import-custom-columns-list">
                        {customColumns.map((col) => (
                          <span key={col} className="import-custom-column-tag">
                            📝 {col}
                            <button onClick={() => handleRemoveCustomColumn(col)}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Data Preview */}
                  <div className="import-preview-section">
                    <div className="import-preview-header">
                      <span className="import-preview-title">
                        <FileSpreadsheet className="w-4 h-4" />
                        Data Preview
                      </span>
                      <span className="import-preview-count">
                        {hasHeaders ? importData.length - 1 : importData.length} records found
                      </span>
                    </div>
                    <div className="import-preview-table-wrapper">
                      <table className="import-preview-table">
                        <thead>
                          <tr>
                            {(importData[0] || []).map((header, i) => (
                              <th key={i}>
                                {hasHeaders ? header : `Col ${i + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(hasHeaders ? importData.slice(1, 6) : importData.slice(0, 5)).map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j} title={cell}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importData.length > 5 && (
                        <div className="import-preview-more">
                          ... and {importData.length - (hasHeaders ? 6 : 5)} more rows
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="import-modal-actions">
                    <button
                      className="import-btn-secondary"
                      onClick={() => {
                        setImportData([]);
                        setColumnMapping({});
                        setCustomColumns([]);
                        setNewCustomColumn("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Back to Upload
                    </button>
                    <button
                      className="import-btn-primary"
                      onClick={handleImport}
                      disabled={importing || !Object.values(columnMapping).some(val => val === "client_name")}
                    >
                      {importing ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Import Clients
                        </>
                      )}
                    </button>
                  </div>
                </>
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

      {/* Client Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedClient && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              className="modal-content crm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Client Details</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
                <div className="crm-details-content p-0">
                  {/* Hero Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-8 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                          {selectedClient.client_name}
                        </h3>
                        {selectedClient.customer_number && (
                          <div className="flex items-center gap-3">
                            <a 
                              href={`tel:${selectedClient.customer_number}`} 
                              className="text-lg font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg"
                            >
                              <Phone className="w-5 h-5" />
                              {selectedClient.customer_number}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedClient.customer_number || "");
                                alert("Number copied!");
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title="Copy number"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm border" style={{
                          ...getLeadTypeBadge(selectedClient.lead_type),
                          borderColor: `${getLeadTypeBadge(selectedClient.lead_type).color}40`
                        }}>
                          {LEAD_TYPE_OPTIONS.find((o) => o.value === selectedClient.lead_type)?.label}
                        </span>
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm border" style={{
                          ...getLeadStageBadge(selectedClient.lead_stage),
                          borderColor: `${getLeadStageBadge(selectedClient.lead_stage).color}40`
                        }}>
                          {LEAD_STAGE_OPTIONS.find((o) => o.value === selectedClient.lead_stage)?.label}
                        </span>
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm border" style={{
                          ...getDealStatusBadge(selectedClient.deal_status),
                          borderColor: `${getDealStatusBadge(selectedClient.deal_status).color}40`
                        }}>
                          {DEAL_STATUS_OPTIONS.find((o) => o.value === selectedClient.deal_status)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mt-1">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Location Preference</label>
                            <div className="text-lg font-medium text-gray-900">
                              {selectedClient.location_category || "Not Specified"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Expected Visit</label>
                            <div className="text-lg font-medium text-gray-900">
                              {selectedClient.expected_visit_date 
                                ? new Date(selectedClient.expected_visit_date).toLocaleDateString("en-IN", {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : "Not Scheduled"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mt-1">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Added On</label>
                            <div className="text-lg font-medium text-gray-900">
                              {new Date(selectedClient.created_at).toLocaleString("en-IN", {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Sheet Info if needed */}
                        {selectedClient.sheet_id && (
                           <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg mt-1">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Source Listing</label>
                              <div className="text-lg font-medium text-gray-900">
                                {sheets.find(s => s.id === selectedClient.sheet_id)?.name || "Unknown Sheet"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes Section with improved styling */}
                    <div className="grid grid-cols-1 gap-6 pt-4">
                      {/* Calling Notes */}
                      <div className="relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg"></div>
                          <div className="bg-indigo-50/50 rounded-r-xl p-6 border border-indigo-100">
                            <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3">
                              <MessageSquare className="w-4 h-4 text-indigo-500" />
                              Calling Interaction
                            </label>
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {selectedClient.calling_comment || "No calling notes recorded yet."}
                            </p>
                          </div>
                      </div>

                      {/* Admin Notes */}
                      {selectedClient.admin_notes && (
                         <div className="relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg"></div>
                            <div className="bg-amber-50/50 rounded-r-xl p-6 border border-amber-100">
                              <label className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider mb-3">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                Admin Remarks
                              </label>
                              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
                                {selectedClient.admin_notes}
                              </p>
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-actions p-8 pt-0 border-t-0">
                  <button 
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all hover:scale-[1.01]"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                  <button 
                     className="flex-[2] py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                     onClick={() => {
                        setEditingClient(selectedClient);
                        setFormData({
                          client_name: selectedClient.client_name,
                          customer_number: selectedClient.customer_number || "",
                          lead_stage: selectedClient.lead_stage,
                          lead_type: selectedClient.lead_type,
                          location_category: selectedClient.location_category || "",
                          calling_comment: selectedClient.calling_comment || "",
                          expected_visit_date: selectedClient.expected_visit_date || "",
                          deal_status: selectedClient.deal_status,
                          admin_notes: selectedClient.admin_notes || "",
                          sheet_id: selectedClient.sheet_id || "",
                        });
                        setShowDetailsModal(false);
                        setShowAddModal(true);
                     }}
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Details
                  </button>
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
                <div className="crm-delete-icon">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3>Delete All Clients?</h3>
                <p>
                  This action cannot be undone. This will permanently delete <strong>{clients.length}</strong> clients from your database.
                </p>
                <div className="crm-delete-actions">
                  <button
                    className="btn-admin-secondary"
                    onClick={() => setShowDeleteAllModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-admin-danger"
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

      {/* Delete Sheet Confirmation Modal */}
      <AnimatePresence>
        {deleteSheetConfirm && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content crm-delete-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="crm-delete-content">
                <div className="crm-delete-icon">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3>Delete Sheet?</h3>
                <p>
                  This will permanently delete the sheet <strong>"{sheets.find(s => s.id === deleteSheetConfirm)?.name}"</strong> and all {clients.filter(c => c.sheet_id === deleteSheetConfirm).length} clients in it.
                </p>
                <div className="crm-delete-actions">
                  <button
                    className="btn-admin-secondary"
                    onClick={() => setDeleteSheetConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-admin-danger"
                    onClick={() => handleDeleteSheet(deleteSheetConfirm)}
                  >
                    Yes, Delete Sheet
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
