"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  MapPin,
  Calendar,
  Search,
  Filter,
  X,
  Clock,
  Users,
  TrendingUp,
  ChevronDown,
  Image as ImageIcon,
  Eye,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
}

interface SiteVisit {
  id: string;
  staff_id: string;
  property_title: string;
  location: string;
  visit_date: string;
  visit_time: string | null;
  notes: string | null;
  photo_url: string;
  created_at: string;
  crm_staff: {
    name: string;
    email: string;
  };
}

export default function AdminSiteVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalVisits: 0,
    thisMonth: 0,
    thisWeek: 0,
    uniqueStaff: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, staffRes] = await Promise.all([
        supabase
          .from("site_visits")
          .select(
            `
            *,
            crm_staff (
              name,
              email
            )
          `
          )
          .order("visit_date", { ascending: false }),
        supabase
          .from("crm_staff")
          .select("id, name, email")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (visitsRes.error) throw visitsRes.error;
      const allVisits = (visitsRes.data || []) as SiteVisit[];
      setVisits(allVisits);
      setStaffList(staffRes.data || []);

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const uniqueStaffIds = new Set(allVisits.map((v) => v.staff_id));

      setStats({
        totalVisits: allVisits.length,
        thisMonth: allVisits.filter(
          (v) => new Date(v.visit_date + "T00:00:00") >= monthStart
        ).length,
        thisWeek: allVisits.filter(
          (v) => new Date(v.visit_date + "T00:00:00") >= weekAgo
        ).length,
        uniqueStaff: uniqueStaffIds.size,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter visits
  const filteredVisits = visits.filter((visit) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        visit.property_title.toLowerCase().includes(q) ||
        visit.location.toLowerCase().includes(q) ||
        visit.crm_staff?.name?.toLowerCase().includes(q) ||
        (visit.notes && visit.notes.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Staff filter
    if (selectedStaff && visit.staff_id !== selectedStaff) return false;

    // Date filters
    if (dateFrom && visit.visit_date < dateFrom) return false;
    if (dateTo && visit.visit_date > dateTo) return false;

    return true;
  });

  // Group visits by staff for analysis
  const staffVisitCounts = visits.reduce(
    (acc, visit) => {
      const name = visit.crm_staff?.name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topStaff = Object.entries(staffVisitCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStaff("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchQuery || selectedStaff || dateFrom || dateTo;

  const formatDate = (dateStr: string, timeStr?: string | null) => {
    const date = new Date(dateStr + "T00:00:00");
    const dateString = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const timeString = timeDate.toLocaleTimeString("en-IN", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${dateString} at ${timeString}`;
    }

    return dateString;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="dashboard-loading">
          <motion.div
            className="loading-spinner-large"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading site visits...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <motion.div
        className="admin-sv-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>
            <MapPin className="w-7 h-7" />
            Staff Site Visits
          </h1>
          <p>Monitor and analyze all staff property visits</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="admin-sv-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-sv-stat-card" style={{ "--stat-color": "#3b82f6" } as React.CSSProperties}>
          <div className="admin-sv-stat-icon">
            <Eye className="w-5 h-5" />
          </div>
          <div className="admin-sv-stat-info">
            <span className="admin-sv-stat-value">{stats.totalVisits}</span>
            <span className="admin-sv-stat-label">Total Visits</span>
          </div>
        </div>
        <div className="admin-sv-stat-card" style={{ "--stat-color": "#22c55e" } as React.CSSProperties}>
          <div className="admin-sv-stat-icon">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="admin-sv-stat-info">
            <span className="admin-sv-stat-value">{stats.thisMonth}</span>
            <span className="admin-sv-stat-label">This Month</span>
          </div>
        </div>
        <div className="admin-sv-stat-card" style={{ "--stat-color": "#f59e0b" } as React.CSSProperties}>
          <div className="admin-sv-stat-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="admin-sv-stat-info">
            <span className="admin-sv-stat-value">{stats.thisWeek}</span>
            <span className="admin-sv-stat-label">This Week</span>
          </div>
        </div>
        <div className="admin-sv-stat-card" style={{ "--stat-color": "#8b5cf6" } as React.CSSProperties}>
          <div className="admin-sv-stat-icon">
            <Users className="w-5 h-5" />
          </div>
          <div className="admin-sv-stat-info">
            <span className="admin-sv-stat-value">{stats.uniqueStaff}</span>
            <span className="admin-sv-stat-label">Active Staff</span>
          </div>
        </div>
      </motion.div>

      {/* Top Performers */}
      {topStaff.length > 0 && (
        <motion.div
          className="admin-sv-top-performers"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2>
            <TrendingUp className="w-5 h-5" />
            Top Performers
          </h2>
          <div className="admin-sv-performers-list">
            {topStaff.map(([name, count], index) => (
              <div key={name} className="admin-sv-performer">
                <span className="admin-sv-performer-rank">#{index + 1}</span>
                <span className="admin-sv-performer-name">{name}</span>
                <span className="admin-sv-performer-count">
                  {count} visit{count !== 1 ? "s" : ""}
                </span>
                <div className="admin-sv-performer-bar">
                  <motion.div
                    className="admin-sv-performer-bar-fill"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(count / (topStaff[0]?.[1] as number || 1)) * 100}%`,
                    }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search & Filters */}
      <motion.div
        className="admin-sv-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="admin-sv-search-row">
          <div className="admin-sv-search-box">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search property, location, or staff name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            className={`admin-sv-filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className="w-4 h-4"
              style={{
                transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
          {hasActiveFilters && (
            <button className="admin-sv-clear-filters" onClick={clearFilters}>
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="admin-sv-filter-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="admin-sv-filter-group">
                <label>Staff Member</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="">All Staff</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-sv-filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="admin-sv-filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Info */}
      <div className="admin-sv-results-info">
        <span>
          Showing <strong>{filteredVisits.length}</strong> of{" "}
          <strong>{visits.length}</strong> visits
        </span>
      </div>

      {/* Visits List */}
      <div className="admin-sv-visits-list">
        {filteredVisits.length === 0 ? (
          <motion.div
            className="admin-sv-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MapPin className="w-12 h-12" />
            <h3>
              {hasActiveFilters
                ? "No visits match your filters"
                : "No site visits recorded yet"}
            </h3>
            <p>
              {hasActiveFilters
                ? "Try adjusting your search or filter criteria."
                : "Staff members will record their visits here."}
            </p>
            {hasActiveFilters && (
              <button className="admin-sv-btn-outline" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          filteredVisits.map((visit, index) => (
            <motion.div
              key={visit.id}
              className="admin-sv-visit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * Math.min(index, 15) }}
            >
              <div
                className="admin-sv-visit-photo"
                onClick={() => setExpandedPhoto(visit.photo_url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={visit.photo_url} alt={visit.property_title} />
                <div className="admin-sv-visit-photo-zoom">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="admin-sv-visit-content">
                <div className="admin-sv-visit-top">
                  <h3>{visit.property_title}</h3>
                  <span className="admin-sv-visit-staff-badge">
                    {visit.crm_staff?.name || "Unknown"}
                  </span>
                </div>
                <div className="admin-sv-visit-meta">
                  <span>
                    <MapPin className="w-3.5 h-3.5" />
                    {visit.location}
                  </span>
                  <span>
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(visit.visit_date, visit.visit_time)}
                  </span>
                  <span>
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimeAgo(visit.created_at)}
                  </span>
                </div>
                {visit.notes && (
                  <p className="admin-sv-visit-notes">{visit.notes}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {expandedPhoto && (
          <motion.div
            className="sv-photo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedPhoto(null)}
          >
            <motion.div
              className="sv-photo-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="sv-photo-modal-close"
                onClick={() => setExpandedPhoto(null)}
              >
                <X className="w-6 h-6" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={expandedPhoto} alt="Site visit photo" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
