import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Separate storage keys ensure admin and user sessions are completely independent
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "ghardaar-user-auth",
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Uses the admin user's JWT via anon key — privilege is granted by RLS (admins table check), not by key type
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "ghardaar-admin-auth",
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const supabaseStaff = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "ghardaar-staff-auth",
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Columns safe for unauthenticated public queries — excludes owner PII and cp_slab
export const PUBLIC_PROPERTY_COLUMNS =
  "id, title, description, price, min_price, max_price, state, city, area, address, " +
  "property_type, listing_type, featured, status, " +
  "images, video_urls, amenities, brochure_urls, " +
  "land_parcel, towers, floors, config, carpet_area, " +
  "rera_no, rera_possession, possession_status, target_possession, litigation, " +
  "approval_status, submitted_by, submission_date, approval_date, rejection_reason, " +
  "created_at, updated_at, builder_name, floor_plan_url, property_age";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  min_price?: number;
  max_price?: number;
  area: string;
  address: string;
  floor_plan_url?: string;
  property_type: "apartment" | "house" | "villa" | "plot" | "commercial";
  listing_type: "sale" | "rent" | "resale";
  images: string[];
  amenities: string[];
  featured: boolean;
  status?: string;
  // Location Details
  state?: string;
  city?: string;
  // Project Details
  land_parcel?: number;
  towers?: number;
  floors?: string;
  config?: string;
  carpet_area?: string;
  // Resale Details
  property_age?: string;
  // RERA & Legal Details
  rera_no?: string;
  rera_possession?: string;
  possession_status?: string;
  target_possession?: string;
  litigation?: boolean;
  // CP Slab
  cp_slab?: string;
  // Brochure
  brochure_urls?: string[];
  // Owner Details
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  // Builder/Developer
  builder_name?: string;
  // Approval workflow
  approval_status?: "pending" | "approved" | "rejected";
  submitted_by?: string;
  submission_date?: string;
  approval_date?: string;
  rejection_reason?: string;
  video_urls?: string[];
  updated_at?: string;
  created_at: string;
}

export interface Brochure {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  is_active: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}
