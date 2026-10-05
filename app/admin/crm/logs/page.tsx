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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import PageHeader from "@/components/admin/PageHeader";

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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
        if (process.env.NODE_ENV === "development") console.error("Error fetching sheets:", error instanceof Error ? error.message : String(error));
      }
    }

    if (user) {
      fetchSheets();
    }
  }, [user]);

  // Fetch all staff for filter dropdown
  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase
          .from("crm_staff")
          .select("id, name")
          .eq("is_active", true)
          .order("name");

        if (error) throw error;
        setStaffList((data || []).map((s) => ({ id: s.id, name: s.name })));
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error fetching staff list:", error instanceof Error ? error.message : String(error));
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
      if (fromDate) {
        query = query.gte("created_at", `${fromDate}T00:00:00`);
      }
      if (toDate) {
        query = query.lte("created_at", `${toDate}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error fetching logs:", error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, selectedSheet, selectedStaff, selectedActionType, fromDate, toDate]);

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
      return { backgroundColor: "var(--color-blue-100)", color: "var(--color-blue-700)" };
    }
    return { backgroundColor: "#fef3c7", color: "#92400e" };
  };

  if (loading || isLoading) {
    return (
      <div className="space-y-3 py-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="admin-page space-y-6">
      <PageHeader
        eyebrow="People"
        title="Staff activity"
        description="Every change staff members make in the CRM."
        back={{ href: "/admin/crm", label: "CRM" }}
        actions={
          <>
            <Button
              onClick={fetchLogs}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by staff, client, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 py-2.5"
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className={`flex items-center gap-2 px-4 py-2.5 font-medium ${
              showFilters
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "text-gray-600"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4 mt-4 border-t border-gray-100"
            >
              <div className="space-y-1">
                <Label className="sr-only">Staff</Label>
                <Select
                  value={selectedStaff || "all"}
                  onValueChange={(value) => {
                    setSelectedStaff(!value || value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="sr-only">Sheet</Label>
                <Select
                  value={selectedSheet || "all"}
                  onValueChange={(value) => {
                    setSelectedSheet(!value || value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="All Sheets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sheets</SelectItem>
                    {sheets.map((sheet) => (
                      <SelectItem key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="sr-only">Action</Label>
                <Select
                  value={selectedActionType || "all"}
                  onValueChange={(value) => {
                    setSelectedActionType(!value || value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="update_field">Field Updates</SelectItem>
                    <SelectItem value="add_comment">Comments Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="sr-only" htmlFor="from-date">
                  From date
                </Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm"
                  title="From date"
                />
              </div>
              <div className="space-y-1">
                <Label className="sr-only" htmlFor="to-date">
                  To date
                </Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm"
                  title="To date"
                />
              </div>
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
            <Table className="w-full">
              <TableHeader className="bg-gray-50 border-b border-gray-200">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Staff
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sheet
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(log.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900">{log.staff_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-gray-900">{log.client_name}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {log.sheet_name ? (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{log.sheet_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full border-transparent"
                        style={getActionBadgeStyle(log.action_type)}
                      >
                        {getActionDescription(log)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          variant="ghost"
          className="flex items-center gap-1 text-gray-600"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">Page {currentPage}</span>
        <Button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={logs.length < ITEMS_PER_PAGE}
          variant="ghost"
          className="flex items-center gap-1 text-gray-600"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
