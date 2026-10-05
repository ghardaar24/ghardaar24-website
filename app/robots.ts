import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ghardaar24.com";
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/staff/", "/api/", "/dashboard/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
