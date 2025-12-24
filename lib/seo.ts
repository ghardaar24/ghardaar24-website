import { Metadata } from "next";

const siteConfig = {
  name: "Ghardaar24",
  tagline: "Find Your Dream Home in Pune",
  description:
    "Discover 500+ verified properties for sale and rent in Pune and nearby areas. Zero brokerage, 100% transparency, expert guidance. Find apartments, houses, villas, plots & commercial properties.",
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
    // Property types
    "2BHK flat Pune",
    "3BHK apartment Pune",
    "villa for sale Pune",
    "plot for sale Pune",
    "commercial property Pune",
    // Intent-based
    "buy home Pune",
    "rent flat Pune",
    "affordable housing Pune",
    "luxury apartments Pune",
    "new projects Pune",
    // Brand & Trust
    "Ghardaar24",
    "zero brokerage Pune",
    "verified properties Pune",
    "trusted real estate agent Pune",
  ],
  author: "Ghardaar24",
  twitterHandle: "@ghardaar24",
  phone: "+91 9876543210",
  email: "contact@ghardaar24.com",
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
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
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
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  verification: {
    google: "your-google-verification-code",
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
        urlTemplate: `${siteConfig.url}/properties?city={search_term_string}`,
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

// JSON-LD Structured Data for Property (RealEstateListing)
export function generatePropertySchema(property: {
  id: string;
  title: string;
  description: string;
  city: string;
  address: string;
  price: number;
  images: string[];
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
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
      addressLocality: property.city,
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      addressCountry: "IN",
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area_sqft,
      unitCode: "FTK",
    },
  };
}

// Generate page-specific metadata
export function generatePropertyMetadata(property: {
  id: string;
  title: string;
  description: string;
  city: string;
  price: number;
  images: string[];
  property_type: string;
  listing_type: string;
}): Metadata {
  const title = `${property.title} - ${
    property.property_type.charAt(0).toUpperCase() +
    property.property_type.slice(1)
  } for ${property.listing_type === "sale" ? "Sale" : "Rent"} in ${
    property.city
  }`;
  const description = `${
    property.property_type.charAt(0).toUpperCase() +
    property.property_type.slice(1)
  } for ${property.listing_type === "sale" ? "sale" : "rent"} in ${
    property.city
  }. ${property.description?.slice(0, 140)}... Contact Ghardaar24 for details.`;

  return {
    title,
    description,
    keywords: [
      `${property.property_type} for ${property.listing_type} ${property.city}`,
      `buy ${property.property_type} ${property.city}`,
      `${property.city} property`,
      `real estate ${property.city}`,
    ],
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/properties/${property.id}`,
      type: "article",
      siteName: siteConfig.name,
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
