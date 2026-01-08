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

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "ghardaar-admin-auth",
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  min_price?: number;
  max_price?: number;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
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
  // RERA & Legal Details
  rera_no?: string;
  possession_status?: string;
  target_possession?: string;
  litigation?: boolean;
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
  created_at: string;
}
