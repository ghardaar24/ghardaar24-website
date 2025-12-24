import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  property_type: "apartment" | "house" | "villa" | "plot" | "commercial";
  listing_type: "sale" | "rent" | "resale";
  images: string[];
  amenities: string[];
  featured: boolean;
  status?: string;
  possession?: string;
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
  rera_possession?: string;
  litigation?: boolean;
  // Brochure
  brochure_url?: string;
  created_at: string;
}
