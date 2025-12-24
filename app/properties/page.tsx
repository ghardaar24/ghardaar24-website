import { supabase, Property } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import { Building } from "lucide-react";
import { Suspense } from "react";
import { MotionSection, StaggerContainer, StaggerItem } from "@/lib/motion";

interface SearchParams {
  city?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  featured?: string;
}

async function getProperties(searchParams: SearchParams): Promise<Property[]> {
  let query = supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

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

  if (searchParams.bedrooms) {
    const beds =
      searchParams.bedrooms === "5+" ? 5 : parseInt(searchParams.bedrooms);
    if (searchParams.bedrooms === "5+") {
      query = query.gte("bedrooms", beds);
    } else {
      query = query.eq("bedrooms", beds);
    }
  }

  if (searchParams.featured === "true") {
    query = query.eq("featured", true);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("Error fetching properties:", error);
    return [];
  }

  return data || [];
}

function getPageTitle(searchParams: SearchParams): string {
  const parts: string[] = [];

  if (searchParams.listing_type === "sale") {
    parts.push("Properties for Sale");
  } else if (searchParams.listing_type === "rent") {
    parts.push("Properties for Rent");
  } else {
    parts.push("All Properties");
  }

  if (searchParams.city) {
    parts.push(`in ${searchParams.city}`);
  }

  if (searchParams.property_type) {
    const type =
      searchParams.property_type.charAt(0).toUpperCase() +
      searchParams.property_type.slice(1);
    parts.unshift(type);
  }

  return parts.join(" ");
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

      <main className="properties-page">
        {/* Page Header */}
        <MotionSection className="page-header">
          <div className="container">
            <StaggerContainer>
              <StaggerItem>
                <div className="breadcrumb">
                  <a href="/">Home</a>
                  <span>/</span>
                  <span>Properties</span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 className="page-title">{pageTitle}</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="page-subtitle">
                  {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"} found
                </p>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </MotionSection>

        {/* Filters & Listings */}
        <section className="listings-section">
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
              <MotionSection>
                <div className="empty-state">
                  <Building className="w-20 h-20 text-gray-300" />
                  <h3>No Properties Found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <a href="/properties" className="btn-primary-new">
                    Clear Filters
                  </a>
                </div>
              </MotionSection>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
