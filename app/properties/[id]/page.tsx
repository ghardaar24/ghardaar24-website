import { supabase, Property, PUBLIC_PROPERTY_COLUMNS } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import ContactForm from "@/components/ContactForm";
import InquiryCTA from "@/components/InquiryCTA";
import ScrollToButton from "@/components/ScrollToButton";
import { formatPrice, formatPriceRange } from "@/lib/utils";
import {
  jsonLd,
  generatePropertyMetadata,
  generatePropertySchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { getAmenityIcon } from "@/lib/amenityIcons";
import {
  MapPin,
  Calendar,
  Building,
  ArrowLeft,
  LandPlot,
  TowerControl,
  Layers,
  LayoutGrid,
  Ruler,
  FileCheck,
  Scale,
  FileText,
  Download,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsClient from "@/components/PropertyDetailsClient";
import ReadMoreText from "@/components/ReadMoreText";
import PropertySectionNavbar from "@/components/PropertySectionNavbar";

export const revalidate = 300;

async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .eq("id", id)
    // only approved listings are public (null = created by admin before approvals existed)
    .or("approval_status.eq.approved,approval_status.is.null")
    .single();

  if (error || !data) {
    return null;
  }

  // Normalize brochures for backward compatibility
  const propertyData = data as unknown as Property & { brochure_url?: string };
  if (!propertyData.brochure_urls && propertyData.brochure_url) {
    propertyData.brochure_urls = [propertyData.brochure_url];
  }

  return propertyData as Property;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return { title: "Property Not Found" };
  }

  return generatePropertyMetadata(property);
}

async function getSimilarProperties(property: Property): Promise<Property[]> {
  const { data } = await supabase
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .eq("area", property.area)
    .eq("property_type", property.property_type)
    .neq("id", property.id)
    .or("approval_status.eq.approved,approval_status.is.null")
    .limit(4);

  return (data as unknown as Property[]) || [];
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarProperties(property);

  const listingLabel =
    property.listing_type === "sale"
      ? "For sale"
      : property.listing_type === "resale"
      ? "Resale"
      : "For rent";
  const typeLabel =
    property.property_type.charAt(0).toUpperCase() +
    property.property_type.slice(1);
  const price =
    property.min_price || property.max_price
      ? formatPriceRange(property.min_price, property.max_price)
      : formatPrice(property.price);

  // Spec sheet rows; empty values are dropped.
  const specs = [
    { icon: LayoutGrid, label: "Configuration", value: property.config },
    { icon: Ruler, label: "Carpet area", value: property.carpet_area },
    { icon: LandPlot, label: "Land parcel", value: property.land_parcel ? String(property.land_parcel) : "" },
    { icon: TowerControl, label: "Towers", value: property.towers ? String(property.towers) : "" },
    { icon: Layers, label: "Floors", value: property.floors },
    { icon: Building, label: "Possession status", value: property.possession_status },
    { icon: Calendar, label: "Target possession", value: property.target_possession },
    { icon: Calendar, label: "RERA possession", value: property.rera_possession },
    { icon: Clock, label: "Property age", value: property.property_age },
    { icon: FileCheck, label: "RERA no.", value: property.rera_no },
  ].filter((s) => s.value);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "description", label: "Description" },
    ...(specs.length > 0 || property.litigation !== undefined ? [{ id: "project-overview", label: "Project details" }] : []),
    ...(property.amenities && property.amenities.length > 0 ? [{ id: "amenities", label: "Amenities" }] : []),
    ...(property.floor_plan_url ? [{ id: "floor-plan", label: "Floor plan" }] : []),
    ...(property.video_urls && property.video_urls.length > 0 ? [{ id: "videos", label: "Videos" }] : []),
    { id: "property-map", label: "Location" },
  ];

  const quickFacts = [
    { label: "Type", value: typeLabel },
    { label: "Carpet area", value: property.carpet_area },
    { label: "Configuration", value: property.config },
    { label: "Possession", value: property.possession_status || property.target_possession },
  ].filter((f) => f.value);

  return (
    <>
      {/* JSON-LD Structured Data for Property */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generatePropertySchema(property)),
        }}
      />

      {/* JSON-LD Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generateBreadcrumbSchema(property)),
        }}
      />

      <Header />

      <PropertyDetailsClient propertyTitle={property.title}>
        <main className="hlx-page pdx-page">
          {/* Dusk header: title, price and quick facts */}
          <section className="plx-head pdx-head">
            <div className="container">
              <Link href="/properties" className="pdx-back">
                <ArrowLeft className="w-4 h-4" />
                All properties
              </Link>

              <div className="pdx-head-grid">
                <div>
                  <div className="pdx-badges">
                    <span className="pdx-badge pdx-badge--solid">{listingLabel}</span>
                    <span className="pdx-badge">{typeLabel}</span>
                    {property.featured && <span className="pdx-badge">Featured</span>}
                  </div>
                  <h1 className="plx-title pdx-title">{property.title}</h1>
                  <p className="pdx-location">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {property.address}
                      {property.address && property.area ? ", " : ""}
                      {property.area}
                    </span>
                    <ScrollToButton
                      targetId="property-map"
                      block="center"
                      className="pdx-map-link"
                    >
                      View on map
                    </ScrollToButton>
                  </p>
                </div>

                <div className="pdx-price">
                  <span className="pdx-price-label">
                    {property.listing_type === "rent" ? "Rent" : "Price"}
                  </span>
                  <span className="pdx-price-value">
                    {price}
                    {property.listing_type === "rent" && <small>/month</small>}
                  </span>
                </div>
              </div>

              {quickFacts.length > 0 && (
                <dl className="pdx-facts" id="overview">
                  {quickFacts.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>

          {/* Gallery, pulled up over the header's edge */}
          <section className="pdx-gallery">
            <div className="container">
              <ImageGallery images={property.images || []} title={property.title} />
            </div>
          </section>

          <section className="pdx-body">
            <div className="container pdx-layout">
              <div className="pdx-main">
                <PropertySectionNavbar sections={sections} />

                <div className="pdx-section" id="description">
                  <h2 className="pdx-h2">About this property</h2>
                  <ReadMoreText text={property.description || ""} maxLength={250} />
                </div>

                {(specs.length > 0 || property.litigation !== undefined) && (
                  <div className="pdx-section" id="project-overview">
                    <h2 className="pdx-h2">Project details</h2>
                    <dl className="pdx-specs">
                      {specs.map(({ icon: Icon, label, value }) => (
                        <div key={label}>
                          <dt>
                            <Icon className="w-4 h-4" aria-hidden="true" />
                            {label}
                          </dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                      {property.litigation !== undefined && (
                        <div>
                          <dt>
                            <Scale className="w-4 h-4" aria-hidden="true" />
                            Litigation
                          </dt>
                          <dd className={property.litigation ? "pdx-flag-bad" : "pdx-flag-good"}>
                            {property.litigation ? "Yes, ask us for details" : "None"}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {property.amenities && property.amenities.length > 0 && (
                  <div className="pdx-section" id="amenities">
                    <h2 className="pdx-h2">Amenities</h2>
                    <ul className="pdx-amenities">
                      {property.amenities.map((amenity: string) => {
                        const AmenityIcon = getAmenityIcon(amenity);
                        return (
                          <li key={amenity}>
                            <AmenityIcon className="w-4 h-4" aria-hidden="true" />
                            {amenity}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {property.floor_plan_url && (
                  <div className="pdx-section" id="floor-plan">
                    <h2 className="pdx-h2">Floor plan</h2>
                    <div className="pdx-media pdx-floorplan">
                      <Image
                        src={property.floor_plan_url}
                        alt={`Floor plan of ${property.title}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {property.video_urls && property.video_urls.length > 0 && (
                  <div className="pdx-section" id="videos">
                    <h2 className="pdx-h2">Videos</h2>
                    <div className="pdx-videos">
                      {property.video_urls.map((url, index) => (
                        <div key={index} className="pdx-media pdx-video">
                          <video src={url} controls preload="metadata" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.brochure_urls && property.brochure_urls.length > 0 && (
                  <div className="pdx-section">
                    <h2 className="pdx-h2">Brochures</h2>
                    <div className="pdx-brochures">
                      {property.brochure_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdx-brochure"
                        >
                          <FileText className="w-5 h-5" aria-hidden="true" />
                          <span>
                            Brochure{property.brochure_urls!.length > 1 ? ` ${index + 1}` : ""}
                            <small>PDF</small>
                          </span>
                          <Download className="w-4 h-4" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <InquiryCTA />

                <div id="property-map" className="pdx-section">
                  <h2 className="pdx-h2">Location</h2>
                  <p className="pdx-map-address">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    {property.address}, {property.area}
                  </p>
                  <div className="pdx-media pdx-map">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        `${property.address}, ${property.area}, Pune, Maharashtra, India`
                      )}&output=embed`}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map showing location of ${property.title}`}
                    />
                  </div>
                  <p className="pdx-map-note">
                    The pin shows the area. For the exact location or a site
                    visit, send us an inquiry.
                  </p>
                </div>
              </div>

              <aside className="pdx-sidebar">
                <div className="pdx-sticky">
                  <ContactForm propertyId={property.id} propertyTitle={property.title} />
                </div>
              </aside>
            </div>
          </section>

          {similarProperties.length > 0 && (
            <section className="hlx-section pdx-similar">
              <div className="container">
                <span className="featured-v2-eyebrow">More in {property.area}</span>
                <h2 className="featured-v2-title">
                  Similar <em>listings nearby.</em>
                </h2>
                <div className="properties-grid">
                  {similarProperties.map((prop, i) => (
                    <PropertyCard key={prop.id} property={prop} index={i} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </PropertyDetailsClient>

      <Footer />
    </>
  );
}
