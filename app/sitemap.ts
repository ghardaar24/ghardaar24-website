import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

const BASE_URL = "https://ghardaar24.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic property pages
  const { data: properties } = await supabase
    .from("properties")
    .select("id, updated_at")
    .eq("status", "active");

  const propertyPages: MetadataRoute.Sitemap = (properties || []).map(
    (property) => ({
      url: `${BASE_URL}/properties/${property.id}`,
      lastModified: new Date(property.updated_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  return [...staticPages, ...propertyPages];
}
