"use client";

import { useEffect, useState, useRef } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  Building,
  MessageSquare,
  Plus,
  Eye,
  ArrowRight,
  Star,
  Clock,
  Camera,
  User,
  Mail,
  Loader2,
  Trash2,
  CheckSquare,
  Users,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalProperties: number;
  featuredProperties: number;
  totalInquiries: number;
  pendingApprovals: number;
  totalLeads: number;
  openTasks: number;
}

interface Inquiry {
  id: string;
  name: string;
  created_at: string;
  property_id: string;
}

interface RecentProperty {
  id: string;
  title: string;
  price: number;
  images: string[];
  created_at: string;
  approval_status?: string;
}

const statCards = [
  { key: "totalProperties", icon: Building, label: "Properties", href: "/admin/properties" },
  { key: "featuredProperties", icon: Star, label: "Featured", href: "/admin/properties" },
  { key: "totalInquiries", icon: MessageSquare, label: "Inquiries", href: "/admin/inquiries" },
  { key: "pendingApprovals", icon: ClipboardCheck, label: "Pending approvals", href: "/admin/approvals" },
  { key: "totalLeads", icon: Users, label: "Leads", href: "/admin/leads" },
  { key: "openTasks", icon: CheckSquare, label: "Open tasks", href: "/admin/tasks" },
] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function AdminDashboard() {
  const { adminProfile, refreshProfile } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    featuredProperties: 0,
    totalInquiries: 0,
    pendingApprovals: 0,
    totalLeads: 0,
    openTasks: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveProfilePicture = async () => {
    if (!adminProfile || !adminProfile.profile_picture_url) return;
    if (!window.confirm("Remove profile picture?")) return;

    setRemovingPicture(true);
    try {
      const { error } = await supabase
        .from("admins")
        .update({ profile_picture_url: null })
        .eq("id", adminProfile.id);

      if (error) throw error;

      await refreshProfile();
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error removing profile picture:", error);
      alert("Failed to remove profile picture. Please try again.");
    } finally {
      setRemovingPicture(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminProfile) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    setUploadingPicture(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `admin/${adminProfile.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("admins")
        .update({ profile_picture_url: urlWithCacheBust })
        .eq("id", adminProfile.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          propertiesRes,
          featuredRes,
          inquiriesRes,
          inquiriesListRes,
          pendingApprovalsRes,
          leadsRes,
          openTasksRes,
          recentPropertiesRes,
        ] = await Promise.all([
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("featured", true),
          supabase
            .from("inquiries")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("id, name, created_at, property_id")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("approval_status", "pending"),
          supabase
            .from("user_profiles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("staff_tasks")
            .select("id", { count: "exact", head: true })
            .neq("status", "completed"),
          supabase
            .from("properties")
            .select("id, title, price, images, created_at, approval_status")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalProperties: propertiesRes.count || 0,
          featuredProperties: featuredRes.count || 0,
          totalInquiries: inquiriesRes.count || 0,
          pendingApprovals: pendingApprovalsRes.count || 0,
          totalLeads: leadsRes.count || 0,
          openTasks: openTasksRes.count || 0,
        });

        setRecentInquiries(inquiriesListRes.data || []);
        setRecentProperties(recentPropertiesRes.data || []);
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
        <div className="space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = (adminProfile?.name || "Admin").split(" ")[0];
  const attention = [
    { count: stats.pendingApprovals, label: "properties waiting for approval", href: "/admin/approvals" },
    { count: stats.openTasks, label: "open tasks", href: "/admin/tasks" },
  ].filter((a) => a.count > 0);

  return (
    <div className="admin-page bo-dash">
      {/* Greeting banner */}
      <motion.section
        className="bo-banner"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bo-banner-main">
          {adminProfile && (
            <div
              className="profile-avatar-wrapper bo-banner-avatar"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
            >
              <Avatar className="profile-avatar-img w-16 h-16">
                <AvatarImage src={adminProfile.profile_picture_url || undefined} alt={adminProfile.name || "Admin"} />
                <AvatarFallback className="profile-avatar-placeholder">
                  <User className="w-7 h-7" />
                </AvatarFallback>
              </Avatar>
              <div className="profile-avatar-overlay">
                {uploadingPicture || removingPicture ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    {adminProfile.profile_picture_url && (
                      <Trash2
                        className="w-5 h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProfilePicture();
                        }}
                      />
                    )}
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: "none" }}
              />
            </div>
          )}
          <div>
            <p className="bo-banner-date">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="bo-banner-title">
              {greeting()}, <em>{firstName}.</em>
            </h1>
            {adminProfile?.email && (
              <p className="bo-banner-sub">
                <Mail className="w-4 h-4" aria-hidden="true" />
                {adminProfile.email}
              </p>
            )}
          </div>
        </div>
        <Link href="/admin/properties/new" className="bo-btn bo-btn--solid">
          <Plus className="w-4 h-4" />
          Add property
        </Link>
      </motion.section>

      {/* Needs attention */}
      {attention.length > 0 && (
        <div className="bo-attention">
          <span className="bo-attention-label">Needs attention</span>
          {attention.map((a) => (
            <Link key={a.href} href={a.href} className="bo-attention-item">
              <strong>{a.count}</strong> {a.label}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <motion.div
        className="bo-stats"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.key} variants={fadeInUp}>
            <Link href={stat.href} className="bo-stat">
              <span className="bo-stat-icon">
                <stat.icon className="w-4 h-4" />
              </span>
              <span className="bo-stat-value">{stats[stat.key as keyof Stats]}</span>
              <span className="bo-stat-label">{stat.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent activity */}
      <div className="bo-two-col">
        <section className="bo-panel">
          <div className="bo-panel-head">
            <h2>Recent inquiries</h2>
            <Link href="/admin/inquiries" className="bo-link">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentInquiries.length > 0 ? (
            <ul className="bo-list">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <span className="bo-list-avatar">{inquiry.name.charAt(0).toUpperCase()}</span>
                  <span className="bo-list-main">
                    <span className="bo-list-title">{inquiry.name}</span>
                    <span className="bo-list-meta">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(inquiry.created_at)}
                    </span>
                  </span>
                  <Link href="/admin/inquiries" className="bo-icon-btn" aria-label={`View inquiry from ${inquiry.name}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bo-empty">
              <MessageSquare className="w-6 h-6" />
              <p>No inquiries yet</p>
            </div>
          )}
        </section>

        <section className="bo-panel">
          <div className="bo-panel-head">
            <h2>Recent properties</h2>
            <Link href="/admin/properties" className="bo-link">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentProperties.length > 0 ? (
            <ul className="bo-list">
              {recentProperties.map((property) => (
                <li key={property.id}>
                  <span className="bo-list-avatar bo-list-thumb">
                    {property.images?.[0] ? (
                      <Image src={property.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <Building className="w-4 h-4" />
                    )}
                  </span>
                  <span className="bo-list-main">
                    <span className="bo-list-title">{property.title}</span>
                    <span className="bo-list-meta">
                      {formatPrice(property.price)} · {formatTimeAgo(property.created_at)}
                    </span>
                  </span>
                  {property.approval_status === "pending" && (
                    <span className="bo-badge bo-badge--warn">Pending</span>
                  )}
                  <Link href={`/admin/properties/${property.id}`} className="bo-icon-btn" aria-label={`Edit ${property.title}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bo-empty">
              <Building className="w-6 h-6" />
              <p>No properties yet</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
