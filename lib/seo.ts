import { Metadata } from "next";

const siteConfig = {
  name: "Ghardaar24",
  tagline: "Find Your Dream Home",
  description:
    "Discover thousands of properties for sale and rent across India. Your trusted partner in finding the perfect home with verified listings.",
  url: "https://ghardaar24.com",
  ogImage: "/og-image.jpg",
  keywords: [
    "real estate India",
    "property for sale",
    "houses for rent",
    "apartments Mumbai",
    "buy home Delhi",
    "flats Bangalore",
    "villa Hyderabad",
    "property listings",
    "real estate agent",
    "home buyer",
    "rental property",
    "2BHK apartment",
    "3BHK flat",
    "commercial property",
  ],
  author: "Ghardaar24",
  twitterHandle: "@ghardaar24",
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export function generatePropertyMetadata(property: {
  title: string;
  description: string;
  city: string;
  price: number;
  images: string[];
  property_type: string;
  listing_type: string;
}): Metadata {
  const title = property.title;
  const description = `${property.property_type} for ${
    property.listing_type
  } in ${property.city}. ${property.description?.slice(0, 150)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images:
        property.images?.length > 0
          ? [property.images[0]]
          : [siteConfig.ogImage],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images:
        property.images?.length > 0
          ? [property.images[0]]
          : [siteConfig.ogImage],
    },
  };
}

export default siteConfig;
