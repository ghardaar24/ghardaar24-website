"use client";

import { useEffect, useState } from "react";
import { supabase, Property } from "@/lib/supabase";
import {
  Building,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  ArrowRight,
  Home,
  MapPin,
  Star,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";

interface Stats {
  totalProperties: number;
  featuredProperties: number;
  totalInquiries: number;
}

interface Inquiry {
  id: string;
  name: string;
  created_at: string;
  property_id: string;
}

const statCards = [
  {
    key: "totalProperties",
    icon: Building,
    label: "Total Properties",
    color: "blue",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    bgLight: "#dbeafe",
  },
  {
    key: "featuredProperties",
    icon: Star,
    label: "Featured",
    color: "yellow",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bgLight: "#fef3c7",
  },
  {
    key: "totalInquiries",
    icon: MessageSquare,
    label: "Total Inquiries",
    color: "green",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    bgLight: "#dcfce7",
  },
];

const quickActions = [
  {
    href: "/admin/properties/new",
    icon: Plus,
    label: "Add Property",
    description: "Create a new listing",
    primary: true,
  },
  {
    href: "/admin/properties",
    icon: Building,
    label: "All Properties",
    description: "Manage listings",
    primary: false,
  },
  {
    href: "/admin/inquiries",
    icon: MessageSquare,
    label: "Inquiries",
    description: "View messages",
    primary: false,
  },
  {
    href: "/",
    icon: ExternalLink,
    label: "View Site",
    description: "See live website",
    primary: false,
    external: true,
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    featuredProperties: 0,
    totalInquiries: 0,
  });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propertiesRes, featuredRes, inquiriesRes, recentRes, inquiriesListRes] =
          await Promise.all([
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
              .from("properties")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(4),
            supabase
              .from("inquiries")
              .select("id, name, created_at, property_id")
              .order("created_at", { ascending: false })
              .limit(5),
          ]);

        setStats({
          totalProperties: propertiesRes.count || 0,
          featuredProperties: featuredRes.count || 0,
          totalInquiries: inquiriesRes.count || 0,
        });

        setRecentProperties(recentRes.data || []);
        setRecentInquiries(inquiriesListRes.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
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
            Loading dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Welcome Header */}
      <motion.div
        className="dashboard-welcome"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-welcome-content">
          <h1>Welcome Back! 👋</h1>
          <p>Here&apos;s what&apos;s happening with your properties today.</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/admin/properties/new" className="dashboard-cta-btn">
            <Plus className="w-5 h-5" />
            Add New Property
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="dashboard-stats-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            className="dashboard-stat-card"
            variants={fadeInUp}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            style={{ "--stat-gradient": stat.gradient, "--stat-bg": stat.bgLight } as React.CSSProperties}
          >
            <div className="dashboard-stat-icon">
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="dashboard-stat-info">
              <motion.span
                className="dashboard-stat-value"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
              >
                {stats[stat.key as keyof Stats]}
              </motion.span>
              <span className="dashboard-stat-label">{stat.label}</span>
            </div>
            <div className="dashboard-stat-decoration" />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="dashboard-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="dashboard-quick-actions">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={action.href}
                className={`dashboard-action-card ${action.primary ? "primary" : ""}`}
                target={action.external ? "_blank" : undefined}
              >
                <div className="dashboard-action-icon">
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="dashboard-action-text">
                  <span className="dashboard-action-label">{action.label}</span>
                  <span className="dashboard-action-desc">{action.description}</span>
                </div>
                <ArrowRight className="dashboard-action-arrow w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Properties */}
        <motion.div
          className="dashboard-section dashboard-properties-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Properties</h2>
            <Link href="/admin/properties" className="dashboard-view-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentProperties.length > 0 ? (
            <div className="dashboard-properties-grid">
              {recentProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="dashboard-property-card"
                  >
                    <div className="dashboard-property-image">
                      {property.images && property.images[0] ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="dashboard-property-placeholder">
                          <Home className="w-8 h-8" />
                        </div>
                      )}
                      {property.featured && (
                        <span className="dashboard-property-featured">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="dashboard-property-info">
                      <h3 className="dashboard-property-title">{property.title}</h3>
                      <div className="dashboard-property-meta">
                        <span className="dashboard-property-location">
                          <MapPin className="w-3 h-3" />
                          {property.area}
                        </span>
                        <span className="dashboard-property-type">
                          {property.property_type}
                        </span>
                      </div>
                      <div className="dashboard-property-price">
                        ₹{property.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <Home className="w-12 h-12" />
              <p>No properties yet</p>
              <Link href="/admin/properties/new" className="dashboard-empty-cta">
                Add your first property
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Inquiries */}
        <motion.div
          className="dashboard-section dashboard-inquiries-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="dashboard-view-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentInquiries.length > 0 ? (
            <div className="dashboard-inquiries-list">
              {recentInquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  className="dashboard-inquiry-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                >
                  <div className="dashboard-inquiry-avatar">
                    {inquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="dashboard-inquiry-info">
                    <span className="dashboard-inquiry-name">{inquiry.name}</span>
                    <span className="dashboard-inquiry-time">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(inquiry.created_at)}
                    </span>
                  </div>
                  <Link
                    href="/admin/inquiries"
                    className="dashboard-inquiry-action"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state small">
              <MessageSquare className="w-8 h-8" />
              <p>No inquiries yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
