"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Search,
  Filter,
  Clock,
  User,
  FileSpreadsheet,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Types
interface ActivityLog {
  id: string;
  staff_id: string;
  staff_name: string;
  client_id: string;
  client_name: string;
  sheet_id: string | null;
  sheet_name: string | null;
  action_type: string;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface CRMSheet {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 50;

export default function CRMLogsPage() {
  const { user, loading } = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheets, setSheets] = useState<CRMSheet[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedActionType, setSelectedActionType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch sheets for filter dropdown
  useEffect(() => {
    async function fetchSheets() {
      try {
        const { data, error } = await supabase
          .from("crm_sheets")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setSheets(data || []);
      } catch (error) {
        console.error("Error fetching sheets:", error instanceof Error ? error.message : String(error));
      }
    }

    if (user) {
      fetchSheets();
    }
  }, [user]);

  // Fetch unique staff from logs for filter dropdown
  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase
          .from("crm_activity_logs")
          .select("staff_id, staff_name")
          .order("staff_name");

        if (error) throw error;

        // Get unique staff
        const uniqueStaff = Array.from(
          new Map((data || []).map((s) => [s.staff_id, s])).values()
        );
        setStaffList(uniqueStaff.map((s) => ({ id: s.staff_id, name: s.staff_name })));
      } catch (error) {
        console.error("Error fetching staff list:", error instanceof Error ? error.message : String(error));
      }
    }

    if (user) {
      fetchStaff();
    }
  }, [user]);

  // Fetch logs
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("crm_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (selectedSheet) {
        query = query.eq("sheet_id", selectedSheet);
      }
      if (selectedStaff) {
        query = query.eq("staff_id", selectedStaff);
      }
      if (selectedActionType) {
        query = query.eq("action_type", selectedActionType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, selectedSheet, selectedStaff, selectedActionType]);

  // Filter logs by search query (client-side)
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.staff_name.toLowerCase().includes(query) ||
      log.client_name.toLowerCase().includes(query) ||
      log.sheet_name?.toLowerCase().includes(query) ||
      log.field_changed?.toLowerCase().includes(query) ||
      log.new_value?.toLowerCase().includes(query)
    );
  });

  // Get action description
  const getActionDescription = (log: ActivityLog): string => {
    if (log.action_type === "add_comment") {
      return `Added calling comment`;
    }
    if (log.action_type === "update_field" && log.field_changed) {
      return `Changed ${log.field_changed}`;
    }
    return log.action_type;
  };

  // Get action badge style
  const getActionBadgeStyle = (actionType: string) => {
    if (actionType === "add_comment") {
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    }
    return { backgroundColor: "#fef3c7", color: "#92400e" };
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/crm" className="hover:text-gray-700">
              CRM
            </Link>
            <span>/</span>
            <span className="text-gray-900">Activity Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-indigo-600" />
            Staff Activity Logs
          </h1>
          <p className="text-gray-500 mt-1">Track all changes made by staff members</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by staff, client, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${
              showFilters
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-gray-100"
            >
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Staff</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedSheet}
                onChange={(e) => {
                  setSelectedSheet(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sheets</option>
                {sheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedActionType}
                onChange={(e) => {
                  setSelectedActionType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="update_field">Field Updates</option>
                <option value="add_comment">Comments Added</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredLogs.length} activities
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activity logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sheet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(log.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900">{log.staff_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{log.client_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.sheet_name ? (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{log.sheet_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        style={getActionBadgeStyle(log.action_type)}
                      >
                        {getActionDescription(log)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.action_type === "update_field" ? (
                        <div className="text-sm">
                          <span className="text-gray-500 line-through">{log.old_value || "empty"}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-gray-900 font-medium">{log.new_value || "empty"}</span>
                        </div>
                      ) : log.action_type === "add_comment" ? (
                        <div className="text-sm text-gray-600 truncate max-w-xs" title={log.new_value || ""}>
                          &quot;{log.new_value?.substring(0, 50)}{(log.new_value?.length || 0) > 50 ? "..." : ""}&quot;
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-600">Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={logs.length < ITEMS_PER_PAGE}
          className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
