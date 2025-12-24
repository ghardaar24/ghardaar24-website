"use client";

import { useEffect, useState } from "react";
import { supabase, Property } from "@/lib/supabase";
import { Building, MessageSquare, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";

interface Stats {
  totalProperties: number;
  featuredProperties: number;
  totalInquiries: number;
  newInquiries: number;
}

const statCards = [
  {
    key: "totalProperties",
    icon: Building,
    label: "Total Properties",
    color: "blue",
  },
  {
    key: "featuredProperties",
    icon: TrendingUp,
    label: "Featured",
    color: "yellow",
  },
  {
    key: "totalInquiries",
    icon: MessageSquare,
    label: "Total Inquiries",
    color: "green",
  },
  { key: "newInquiries", icon: Eye, label: "New Inquiries", color: "purple" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    featuredProperties: 0,
    totalInquiries: 0,
    newInquiries: 0,
  });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propertiesRes, featuredRes, inquiriesRes, recentRes] =
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
              .limit(5),
          ]);

        setStats({
          totalProperties: propertiesRes.count || 0,
          featuredProperties: featuredRes.count || 0,
          totalInquiries: inquiriesRes.count || 0,
          newInquiries: 0,
        });

        setRecentProperties(recentRes.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <motion.div
          className="admin-loading-inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading dashboard...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your properties.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="stats-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            className="stat-card"
            variants={fadeInUp}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`stat-card-icon ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="stat-card-content">
              <motion.span
                className="stat-card-value"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
              >
                {stats[stat.key as keyof Stats]}
              </motion.span>
              <span className="stat-card-label">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="admin-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/admin/properties/new"
              className="quick-action-btn primary"
            >
              + Add New Property
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link href="/admin/inquiries" className="quick-action-btn">
              View Inquiries
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link href="/admin/properties" className="quick-action-btn">
              Manage Properties
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Properties */}
      <motion.div
        className="admin-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="section-header-row">
          <h2>Recent Properties</h2>
          <Link href="/admin/properties" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentProperties.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>City</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map((property, index) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <td>
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="table-link"
                      >
                        {property.title}
                      </Link>
                    </td>
                    <td>{property.city}</td>
                    <td className="capitalize">{property.property_type}</td>
                    <td>₹{property.price.toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          property.featured ? "featured" : "normal"
                        }`}
                      >
                        {property.featured ? "Featured" : "Active"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            className="empty-state-small"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>
              No properties yet.{" "}
              <Link href="/admin/properties/new">Add your first property</Link>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
