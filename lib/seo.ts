import { Metadata } from "next";

const siteConfig = {
  name: "Ghardaar24",
  tagline: "Zero Brokerage",
  description:
    "Find your dream home in Pune with Ghardaar24. Zero Brokerage, 100% Verified Properties. Buy, Rent, or Sell Flats, Villas, & Commercial Spaces in Prime Locations like Baner, Wakad, Hinjewadi & more.",
  url: "https://ghardaar24.com",
  keywords: [
    // Primary keywords
    "real estate Pune",
    "property for sale Pune",
    "flats for rent Pune",
    "buy apartment Pune",
    "houses for sale Pune",
    // Location-specific
    "property Hinjewadi",
    "flats Wakad",
    "apartments Baner",
    "property Kharadi",
    "houses Pimpri Chinchwad",
    "flats Viman Nagar",
    "apartments Koregaon Park",
    "property Kalyani Nagar",
    "flats Hadapsar",
    "apartments Magarpatta",
    "properties Wagholi",
    "flats Ravet",
    "apartments Moshi",
    // Property types
    "1BHK flat Pune",
    "2BHK flat Pune",
    "3BHK apartment Pune",
    "4BHK luxury flat Pune",
    "villa for sale Pune",
    "row house for sale Pune",
    "duplex for sale Pune",
    "plot for sale Pune",
    "commercial property Pune",
    "office space for rent Pune",
    "shop for sale Pune",
    // Intent-based
    "buy home Pune",
    "rent flat Pune",
    "affordable housing Pune",
    "luxury apartments Pune",
    "new projects Pune",
    "no brokerage flats Pune",
    "direct owner properties Pune",
    "resale flats Pune",
    "ready to move flats Pune",
    "under construction projects Pune",
    // Brand & Trust
    "Ghardaar24",
    "zero brokerage Pune",
    "verified properties Pune",
    "trusted real estate agent Pune",
    "best property Dealer in Pune",
  ],
  author: "Ghardaar24",
  phone: "+91 96736 55631",
  email: "ghardaar24@gmail.com",
  address: {
    streetAddress: "Pune",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411001",
    addressCountry: "IN",
  },
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Buy & Rent Properties in Pune | ${siteConfig.tagline} – ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `Buy & Rent Properties in Pune | Zero Brokerage – ${siteConfig.name}`,
    description: siteConfig.description,
  },
  verification: {
    google: "P6EJyLO6A_t98WjwyHAxioQPJm0LxdQSvTQ24MCbS5A",
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-IN": siteConfig.url,
    },
  },
  category: "Real Estate",
};

// JSON-LD Structured Data for Organization
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo2.png`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
    areaServed: {
      "@type": "City",
      name: "Pune",
      containedIn: {
        "@type": "State",
        name: "Maharashtra",
      },
    },
    priceRange: "₹₹ - ₹₹₹₹",
  };
}

// JSON-LD Structured Data for Website
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/properties?area={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo2.png`,
      },
    },
  };
}

// JSON-LD Structured Data for BreadcrumbList
export function generateBreadcrumbSchema(property: {
  id: string;
  title: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@id": siteConfig.url,
          name: "Home",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@id": `${siteConfig.url}/properties`,
          name: "Properties",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@id": `${siteConfig.url}/properties/${property.id}`,
          name: property.title,
        },
      },
    ],
  };
}

// JSON-LD Structured Data for Property (RealEstateListing)
export function generatePropertySchema(property: {
  id: string;
  title: string;
  description: string;
  area: string;
  address: string;
  price: number;
  images: string[];
  property_type: string;
  listing_type: string;
  carpet_area?: string;
  created_at: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${siteConfig.url}/properties/${property.id}`,
    datePosted: property.created_at,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "RealEstateAgent",
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.area,
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      addressCountry: "IN",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.carpet_area ? parseInt(property.carpet_area) || 0 : 0,
      unitCode: "FTK",
    },
  };
}

// Generate page-specific metadata
export function generatePropertyMetadata(property: {
  id: string;
  title: string;
  description: string;
  area: string;
  price: number;
  images: string[];
  property_type: string;
  listing_type: string;
}): Metadata {
  // Format: "Modern 3BHK in Kothrud Pune for Sale | Ghardaar24"
  const title = `${property.title} in ${property.area} Pune for ${property.listing_type === "sale" ? "Sale" : "Rent"}`;
  
  // Format: "Buy this modern 3BHK flat in Kothrud, Pune. Spacious layout, premium amenities, great location. Call or WhatsApp Ghardaar24 now."
  const listingAction = property.listing_type === "sale" ? "Buy" : "Rent";
  const description = `${listingAction} this ${property.title.toLowerCase()} in ${property.area}, Pune. ${property.description?.slice(0, 80) || "Spacious layout, premium amenities, great location"}. Call or WhatsApp Ghardaar24 now.`;

  return {
    title,
    description,
    keywords: [
      `${property.property_type} for ${property.listing_type} ${property.area}`,
      `buy ${property.property_type} ${property.area}`,
      `${property.area} property`,
      `real estate ${property.area}`,
    ],
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/properties/${property.id}`,
      type: "article",
      siteName: siteConfig.name,
      images: property.images?.length
        ? [
            {
              url: property.images[0],
              width: 1200,
              height: 630,
              alt: property.title,
            },
          ]
        : undefined,
    },
    alternates: {
      canonical: `${siteConfig.url}/properties/${property.id}`,
    },
  };
}

// Generate properties listing page metadata
export function generatePropertiesListMetadata(filters: {
  city?: string;
  property_type?: string;
  listing_type?: string;
}): Metadata {
  let title = "Properties";
  let description = "Browse verified properties for sale and rent in Pune.";

  if (filters.listing_type === "sale") {
    title = "Properties for Sale";
    description = "Find your dream home from our verified properties for sale.";
  } else if (filters.listing_type === "rent") {
    title = "Properties for Rent";
    description = "Discover rental properties with zero brokerage.";
  }

  if (filters.city) {
    title += ` in ${filters.city}`;
    description = `Browse ${
      filters.listing_type === "rent" ? "rental" : ""
    } properties in ${
      filters.city
    }. Verified listings with photos and details.`;
  }

  if (filters.property_type) {
    const type =
      filters.property_type.charAt(0).toUpperCase() +
      filters.property_type.slice(1);
    title = `${type}s ${
      title.includes("for")
        ? title
        : `for ${filters.listing_type === "rent" ? "Rent" : "Sale"}`
    }`;
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/properties`,
      type: "website",
    },
    alternates: {
      canonical: `${siteConfig.url}/properties`,
    },
  };
}

export default siteConfig;
