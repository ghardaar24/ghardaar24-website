"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion } from "@/lib/motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import Link from "next/link";

interface CRMClient {
  id: string;
  client_name: string;
  lead_stage: string;
  lead_type: string;
  location_category: string | null;
  deal_status: string;
  created_at: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const STAGE_COLORS: Record<string, string> = {
  follow_up_req: "#f59e0b",
  dnp: "#6366f1",
  disqualified: "#ef4444",
  callback_later: "#8b5cf6",
};

const TYPE_COLORS: Record<string, string> = {
  hot: "#ef4444",
  warm: "#f59e0b",
  cold: "#3b82f6",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#f59e0b",
  locked: "#22c55e",
  lost: "#6b7280",
};

export default function AnalyticsPage() {
  const { user, loading } = useAdminAuth();
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const BATCH_SIZE = 1000;
        let allData: CRMClient[] = [];
        let from = 0;
        let to = BATCH_SIZE - 1;
        let fetchMore = true;

        while (fetchMore) {
          const { data, error } = await supabase
            .from("crm_clients")
            .select("id, client_name, lead_stage, lead_type, location_category, deal_status, created_at")
            .range(from, to);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            if (data.length < BATCH_SIZE) {
              fetchMore = false;
            } else {
              from += BATCH_SIZE;
              to += BATCH_SIZE;
            }
          } else {
            fetchMore = false;
          }
        }
        setClients(allData);
      } catch (error) {
        console.error("Error fetching clients for analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchClients();
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- Data Processing for Charts ---

  // 1. Lead Stage Distribution
  const stageCounts = clients.reduce((acc, client) => {
    const stage = client.lead_stage?.toLowerCase() || "unknown";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageData = Object.entries(stageCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    originalKey: name,
  }));

  // 2. Lead Type (Quality)
  const typeCounts = clients.reduce((acc, client) => {
    const type = client.lead_type?.toLowerCase() || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    originalKey: name,
  }));

  // 3. Deal Status
  const statusCounts = clients.reduce((acc, client) => {
    const status = client.deal_status?.toLowerCase() || "open";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    originalKey: name,
  }));

  // 4. Clients by Location
  const locationCounts = clients.reduce((acc, client) => {
    const location = client.location_category || "Unspecified";
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationData = Object.entries(locationCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 locations

  // 5. Growth Trend (Last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const dailyGrowth = clients.reduce((acc, client) => {
    if (!client.created_at) return acc;
    const date = client.created_at.split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendData = last30Days.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: dailyGrowth[date] || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Link href="/admin/crm" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to CRM
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-500">Insights and performance metrics for your clients</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Clients" value={clients.length} icon={<UsersIcon />} color="text-blue-600" bg="bg-blue-50" />
        <StatsCard
          label="Hot Leads"
          value={typeCounts["hot"] || 0}
          icon={<FireIcon />}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatsCard
          label="Deals Locked"
          value={statusCounts["locked"] || 0}
          icon={<CheckIcon />}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatsCard
          label="Lost Deals"
          value={statusCounts["lost"] || 0}
          icon={<XIcon />}
          color="text-gray-600"
          bg="bg-gray-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Deal Status Chart */}
        <ChartCard title="Deal Status Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.originalKey] || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Lead Type (Quality) */}
        <ChartCard title="Lead Quality Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.originalKey] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Lead Stage Distribution */}
        <ChartCard title="Lead Stage Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.originalKey] || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

         {/* Growth Trend */}
         <ChartCard title="Client Acquisition (Last 30 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color, bg }: { label: string; value: number; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bg} ${color}`}>{icon}</div>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <h3 className="text-gray-600 font-medium">{label}</h3>
    </motion.div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      {children}
    </motion.div>
  );
}

// Icons
function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.03 1.13.5 2.2 2.9 2.8Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
