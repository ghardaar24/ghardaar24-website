import { supabase, Property, PUBLIC_PROPERTY_COLUMNS } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import { Suspense } from "react";
import { Metadata } from "next";
import { generatePropertiesListMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";

interface SearchParams {
  state?: string;
  city?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: string;
  max_price?: string;
  possession?: string;
  featured?: string;
  search?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  return generatePropertiesListMetadata({
    city: params.city || params.state,
    property_type: params.property_type,
    listing_type: params.listing_type,
  });
}

async function getProperties(searchParams: SearchParams): Promise<Property[]> {
  let query = supabase
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .or("approval_status.eq.approved,approval_status.is.null")
    .order("created_at", { ascending: false });

  if (searchParams.state) {
    query = query.ilike("state", `%${searchParams.state}%`);
  }

  if (searchParams.city) {
    query = query.ilike("city", `%${searchParams.city}%`);
  }

  if (searchParams.property_type) {
    query = query.eq("property_type", searchParams.property_type);
  }

  if (searchParams.listing_type) {
    query = query.eq("listing_type", searchParams.listing_type);
  }

  if (searchParams.min_price) {
    query = query.gte("price", parseInt(searchParams.min_price));
  }

  if (searchParams.max_price) {
    query = query.lte("price", parseInt(searchParams.max_price));
  }

  if (searchParams.possession) {
    if (searchParams.possession.toLowerCase() === "immediate") {
      query = query.eq("possession_status", "Ready to Move");
    } else {
      query = query.ilike("target_possession", `%${searchParams.possession}%`);
    }
  }

  if (searchParams.featured === "true") {
    query = query.eq("featured", true);
  }

  // Search filter - search across title, area, and city
  if (searchParams.search) {
    const searchTerm = `%${searchParams.search}%`;
    query = query.or(`title.ilike.${searchTerm},area.ilike.${searchTerm},city.ilike.${searchTerm}`);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    if (process.env.NODE_ENV === "development") console.error("Error fetching properties:", error);
    return [];
  }

  return (data as unknown as Property[]) || [];
}

function getPageTitle(searchParams: SearchParams): string {
  const parts: string[] = [];

  if (searchParams.listing_type === "sale") {
    parts.push("Properties for Sale");
  } else if (searchParams.listing_type === "rent") {
    parts.push("Properties for Rent");
  } else if (searchParams.listing_type === "resale") {
    parts.push("Resale Properties");
  } else {
    parts.push("All Properties");
  }

  if (searchParams.city) {
    parts.push(`in ${searchParams.city}`);
  } else if (searchParams.state) {
    parts.push(`in ${searchParams.state}`);
  }

  if (searchParams.property_type) {
    const type =
      searchParams.property_type.charAt(0).toUpperCase() +
      searchParams.property_type.slice(1);
    parts.unshift(type);
  }

  return parts.join(" ");
}

const propertyTypes = [
  { type: "apartment", label: "Apartments" },
  { type: "house", label: "Houses" },
  { type: "villa", label: "Villas" },
  { type: "plot", label: "Plots" },
  { type: "commercial", label: "Commercial" },
];

// Same URL with property_type toggled; other filters are kept.
function typeHref(params: SearchParams, type: string) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => typeof v === "string") as [string, string][]
  );
  if (params.property_type === type) qs.delete("property_type");
  else qs.set("property_type", type);
  const q = qs.toString();
  return q ? `/properties?${q}` : "/properties";
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const properties = await getProperties(params);
  const pageTitle = getPageTitle(params);

  return (
    <>
      <Header />

      <main className="hlx-page plx-page">
        {/* Dusk header with the illustrated type rail */}
        <section className="plx-head">
          <div className="container">
            <nav className="plx-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Properties</span>
            </nav>
            <h1 className="plx-title">{pageTitle}</h1>
            <p className="plx-count">
              <strong>{properties.length}</strong>{" "}
              {properties.length === 1 ? "verified listing" : "verified listings"}
              {" · "}zero brokerage
            </p>

            <ul className="plx-types" aria-label="Filter by property type">
              {propertyTypes.map(({ type, label }) => {
                const active = params.property_type === type;
                return (
                  <li key={type}>
                    <Link
                      href={typeHref(params, type)}
                      className="plx-type"
                      aria-current={active ? "true" : undefined}
                    >
                      <Image
                        src={`/property/${type}.png`}
                        alt=""
                        width={96}
                        height={96}
                        className="plx-type-img"
                      />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Filters & listings */}
        <section className="plx-listings">
          <div className="container">
            <Suspense
              fallback={
                <div
                  className="skeleton"
                  style={{ height: "56px", marginBottom: "2rem" }}
                />
              }
            >
              <PropertyFilters />
            </Suspense>

            {properties.length > 0 ? (
              <div className="properties-grid">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="plx-empty">
                <Image
                  src="/property/plot.png"
                  alt=""
                  width={200}
                  height={200}
                  className="plx-empty-img"
                />
                <h2>No homes match these filters</h2>
                <p>
                  Try removing a filter or widening your price range.
                </p>
                <Link href="/properties" className="hero-v2-btn-primary">
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
