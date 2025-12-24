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
  listing_type: "sale" | "rent";
  images: string[];
  amenities: string[];
  featured: boolean;
  status?: string;
  created_at: string;
}
