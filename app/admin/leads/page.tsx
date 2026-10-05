"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion } from "@/lib/motion";
import { Search, Download, User, Mail, Phone, Calendar, MapPin, Globe, Trash2, AlertTriangle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/admin/PageHeader";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  is_nri?: boolean;
  country?: string;
  state?: string;
  city?: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function findDuplicateIds(profiles: UserProfile[]): Set<string> {
  // Keep oldest entry per phone/email group, mark newer ones as duplicates
  const addDupsFromMap = (map: Map<string, { id: string; created_at: string }[]>, dupIds: Set<string>) => {
    for (const group of map.values()) {
      if (group.length > 1) {
        const sorted = [...group].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        sorted.slice(1).forEach((entry) => dupIds.add(entry.id));
      }
    }
  };

  const phoneMap = new Map<string, { id: string; created_at: string }[]>();
  for (const p of profiles) {
    if (!p.phone) continue;
    const key = normalizePhone(p.phone);
    if (!key) continue;
    const group = phoneMap.get(key) ?? [];
    group.push({ id: p.id, created_at: p.created_at });
    phoneMap.set(key, group);
  }

  const emailMap = new Map<string, { id: string; created_at: string }[]>();
  for (const p of profiles) {
    if (!p.email) continue;
    const key = p.email.toLowerCase().trim();
    const group = emailMap.get(key) ?? [];
    group.push({ id: p.id, created_at: p.created_at });
    emailMap.set(key, group);
  }

  const dupIds = new Set<string>();
  addDupsFromMap(phoneMap, dupIds);
  addDupsFromMap(emailMap, dupIds);
  return dupIds;
}

const RESIDENCY_LABELS: Record<"all" | "indian" | "nri", string> = {
  all: "All Residency",
  indian: "Indian Resident",
  nri: "NRI",
};

const DUPLICATE_LABELS: Record<"all" | "duplicates", string> = {
  all: "All Leads",
  duplicates: "Duplicates Only",
};

export default function LeadsPage() {
  const { user, session, loading } = useAdminAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [residencyFilter, setResidencyFilter] = useState<"all" | "indian" | "nri">("all");
  const [duplicateFilter, setDuplicateFilter] = useState<"all" | "duplicates">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [duplicateIds, setDuplicateIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchProfiles = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const excludedIdsRes = await fetch("/api/admin/get-excluded-ids", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const excludedData = await excludedIdsRes.json().catch(() => ({}));
      const { adminIds: fetchedAdminIds, staffIds: fetchedStaffIds } = excludedData;

      const adminIds = new Set(fetchedAdminIds || []);
      const staffIds = new Set(fetchedStaffIds || []);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const filteredData = (data || []).filter(
        (profile) => !adminIds.has(profile.id) && !staffIds.has(profile.id)
      );

      setProfiles(filteredData);
      setDuplicateIds(findDuplicateIds(filteredData));
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error fetching profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session?.access_token) {
      fetchProfiles();
    }
  }, [user, session, fetchProfiles]);

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm);

    const matchesResidency =
      residencyFilter === "all"
        ? true
        : residencyFilter === "nri"
        ? profile.is_nri
        : !profile.is_nri;

    const matchesDuplicate =
      duplicateFilter === "all" ? true : duplicateIds.has(profile.id);

    return matchesSearch && matchesResidency && matchesDuplicate;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Residency", "Country", "State", "City", "Registered Date"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredProfiles.map((p) =>
          [
            `"${p.name}"`,
            `"${p.email}"`,
            `"${p.phone}"`,
            `"${p.is_nri ? "NRI" : "Indian"}"`,
            `"${p.country || ""}"`,
            `"${p.state || ""}"`,
            `"${p.city || ""}"`,
            `"${new Date(p.created_at).toLocaleDateString()}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProfiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProfiles.map((p) => p.id)));
    }
  };

  const selectAllDuplicates = () => {
    setSelectedIds(new Set([...duplicateIds].filter((id) => filteredProfiles.some((p) => p.id === id))));
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/admin/delete-lead", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 207) {
        setDeleteError(data.error || "Delete failed");
        return;
      }

      setSelectedIds(new Set());
      setDeleteConfirm(false);
      await fetchProfiles();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="admin-page">
        <div className="space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="People"
        title="Leads"
        description="Registered users and their profiles."
        actions={
          <>
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <motion.button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete ({selectedIds.size})</span>
                </motion.button>
              )}
              <motion.button
                onClick={exportToCSV}
                className="btn-admin-export"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </motion.button>
            </div>
          </>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm}
        onOpenChange={(open) => {
          setDeleteConfirm(open);
          if (!open) setDeleteError("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Leads</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{selectedIds.size}</strong> lead{selectedIds.size > 1 ? "s" : ""}? This also removes their login access and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600 p-2 bg-red-50 rounded-lg">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats and Search */}
      <motion.div
        className="leads-stats-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="leads-stat-card">
          <div className="leads-stat-icon">
            <User className="w-6 h-6" />
          </div>
          <div className="leads-stat-info">
            <span className="leads-stat-label">Total Leads</span>
            <span className="leads-stat-value">{filteredProfiles.length}</span>
          </div>
        </div>

        {duplicateIds.size > 0 && (
          <div className="leads-stat-card" style={{ borderColor: "#fca5a5", background: "#fff7f7" }}>
            <div className="leads-stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
              <Copy className="w-6 h-6" />
            </div>
            <div className="leads-stat-info">
              <span className="leads-stat-label">Duplicates Found</span>
              <span className="leads-stat-value" style={{ color: "#dc2626" }}>{duplicateIds.size}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 w-full">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[var(--primary)]/20 focus-within:border-[var(--primary)] transition-all duration-200 flex-1 w-full shadow-sm hover:shadow-md">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 h-auto p-0 border-none bg-transparent shadow-none text-gray-700 placeholder:text-gray-400 text-sm focus-visible:ring-0"
            />
          </div>
          <div className="min-w-[160px] w-full sm:w-auto">
            <Select
              value={residencyFilter}
              onValueChange={(value) => value && setResidencyFilter(value as "all" | "indian" | "nri")}
            >
              <SelectTrigger className="w-full h-auto px-4 py-3 rounded-xl text-sm text-gray-700 border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 focus-visible:ring-[var(--primary)]/20 focus-visible:border-[var(--primary)]">
                <SelectValue>{(value: "all" | "indian" | "nri") => RESIDENCY_LABELS[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Residency</SelectItem>
                <SelectItem value="indian">Indian Resident</SelectItem>
                <SelectItem value="nri">NRI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[160px] w-full sm:w-auto">
            <Select
              value={duplicateFilter}
              onValueChange={(value) => value && setDuplicateFilter(value as "all" | "duplicates")}
            >
              <SelectTrigger
                className={`w-full h-auto px-4 py-3 rounded-xl text-sm shadow-sm hover:shadow-md transition-all duration-200 ${
                  duplicateFilter === "duplicates"
                    ? "bg-red-50 border-red-300 text-red-700 focus-visible:ring-red-200 focus-visible:border-red-400"
                    : "bg-white border-gray-200 text-gray-700 focus-visible:ring-[var(--primary)]/20 focus-visible:border-[var(--primary)]"
                }`}
              >
                <SelectValue>{(value: "all" | "duplicates") => DUPLICATE_LABELS[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="duplicates">Duplicates Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Bulk action bar */}
      {duplicateFilter === "duplicates" && filteredProfiles.length > 0 && (
        <motion.div
          className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 flex-1">
            {duplicateIds.size} duplicate lead{duplicateIds.size > 1 ? "s" : ""} detected (same phone or email). Select records to delete.
          </span>
          <Button
            size="sm"
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs"
            onClick={selectAllDuplicates}
          >
            Select All Duplicates
          </Button>
        </motion.div>
      )}

      {/* Mobile Card View & Desktop Table */}
      <motion.div
        className="admin-section-card leads-table-section"
        style={{ padding: 0 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Desktop Table */}
        <div className="admin-table-container leads-table-desktop">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 40 }}>
                  <Checkbox
                    checked={filteredProfiles.length > 0 && selectedIds.size === filteredProfiles.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile, index) => {
                  const isDup = duplicateIds.has(profile.id);
                  return (
                    <motion.tr
                      key={profile.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.03 }}
                      className={isDup ? "bg-red-50/40" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(profile.id)}
                          onCheckedChange={() => toggleSelect(profile.id)}
                        />
                      </TableCell>
                      <TableCell className="table-property-title">
                        <div className="flex items-center gap-2">
                          {profile.name || "N/A"}
                          {isDup && (
                            <Badge variant="destructive" className="gap-1">
                              <Copy className="w-3 h-3" />
                              dup
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.phone || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-gray-900">
                            {profile.city || profile.state ? (
                              <>{profile.city}{profile.city && profile.state ? ", " : ""}{profile.state}</>
                            ) : "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {profile.is_nri ? (
                              <span className="inline-flex items-center gap-1 text-amber-600">
                                <Globe className="w-3 h-3" />
                                NRI {profile.country && `(${profile.country})`}
                              </span>
                            ) : (
                              <span className="text-gray-400">Indian Citizen</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="empty-state-small">
                    No leads found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="leads-cards-mobile">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile, index) => {
              const isDup = duplicateIds.has(profile.id);
              return (
                <motion.div
                  key={profile.id}
                  className={`lead-card relative ${isDup ? "border-red-200 bg-red-50/30" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isDup && (
                      <Badge variant="destructive" className="rounded-full gap-1">
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </Badge>
                    )}
                    <Checkbox
                      checked={selectedIds.has(profile.id)}
                      onCheckedChange={() => toggleSelect(profile.id)}
                    />
                  </div>
                  <div className="lead-card-header pr-16">
                    <div className="lead-avatar">
                      {profile.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="lead-name-wrapper">
                      <span className="lead-name">{profile.name || "N/A"}</span>
                      <span className="lead-date">
                        <Calendar className="w-3 h-3" />
                        {new Date(profile.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="lead-card-details">
                    <a href={`mailto:${profile.email}`} className="lead-contact">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </a>
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`} className="lead-contact">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </a>
                    )}
                    <div className="lead-contact mt-2 border-t border-gray-100 pt-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">
                          {profile.city || profile.state ? (
                            <>{profile.city}{profile.city && profile.state ? ", " : ""}{profile.state}</>
                          ) : "Location N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {profile.is_nri ? (
                            <span className="text-amber-600 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              NRI {profile.country && `(${profile.country})`}
                            </span>
                          ) : "Indian Citizen"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="empty-state-admin">
              <User className="w-12 h-12" />
              <p>No leads found matching your search.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
