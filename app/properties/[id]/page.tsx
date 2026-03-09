import { supabase, Property } from "@/lib/supabase";
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
  generatePropertyMetadata,
  generatePropertySchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { getAmenityIcon } from "@/lib/amenityIcons";
import {
  Bed,
  Bath,
  Maximize,
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
  FileDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MotionSection, StaggerContainer, StaggerItem } from "@/lib/motion";
import PropertyDetailsClient from "@/components/PropertyDetailsClient";
import ReadMoreText from "@/components/ReadMoreText";
import PropertySectionNavbar from "@/components/PropertySectionNavbar";

async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  // Normalize brochures for backward compatibility
  const propertyData = data as Property & { brochure_url?: string };
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
    .select("*")
    .eq("area", property.area)
    .eq("property_type", property.property_type)
    .neq("id", property.id)
    .limit(4);

  return data || [];
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

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "description", label: "Description" },
    ...(property.land_parcel || property.towers || property.floors || property.config || property.carpet_area || property.rera_no || property.possession_status || property.target_possession || property.litigation !== undefined ? [{ id: "project-overview", label: "Project Details" }] : []),
    ...(property.amenities && property.amenities.length > 0 ? [{ id: "amenities", label: "Amenities" }] : []),
    ...(property.floor_plan_url ? [{ id: "floor-plan", label: "Floor Plan" }] : []),
    ...(property.video_urls && property.video_urls.length > 0 ? [{ id: "videos", label: "Videos" }] : []),
  ];

  return (
    <>
      {/* JSON-LD Structured Data for Property */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generatePropertySchema(property)),
        }}
      />

      {/* JSON-LD Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(property)),
        }}
      />

      <Header />

      <PropertyDetailsClient propertyTitle={property.title}>
        <main className="property-details-page">
          {/* Breadcrumb */}
          <MotionSection className="details-header">
            <div className="container">
              <Link href="/properties" className="back-link">
                <ArrowLeft className="w-4 h-4" />
                Back to Properties
              </Link>
            </div>
          </MotionSection>

          {/* Image Gallery */}
          <MotionSection className="gallery-section" delay={0.1}>
            <div className="container">
              <ImageGallery
                images={property.images || []}
                title={property.title}
              />
            </div>
          </MotionSection>

          {/* Property Info */}
          <section className="property-info-section">
            <div className="container">
              <div className="property-layout">
                {/* Main Content */}
                <div className="property-main">
                  {/* Title & Badges */}
                  <MotionSection delay={0.2}>
                    <div className="property-title-block">
                      <StaggerContainer className="property-badges">
                        <StaggerItem>
                          <span
                            className={`listing-badge ${
                              property.listing_type === "sale" ? "sale" : "rent"
                            }`}
                          >
                            For{" "}
                            {property.listing_type === "sale" ? "Sale" : "Rent"}
                          </span>
                        </StaggerItem>
                        <StaggerItem>
                          <span className="type-badge">
                            {property.property_type.charAt(0).toUpperCase() +
                              property.property_type.slice(1)}
                          </span>
                        </StaggerItem>
                        <StaggerItem>
                          <span className="date-badge">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(property.created_at).toLocaleDateString()}
                          </span>
                        </StaggerItem>
                        {property.featured && (
                          <StaggerItem>
                            <span className="featured-badge">Featured</span>
                          </StaggerItem>
                        )}
                      </StaggerContainer>

                      <h1 className="property-title">{property.title}</h1>

                      <div className="property-location-visual">
                        <div className="location-icon-box">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="location-details">
                          <span className="location-address">
                            {property.address}
                          </span>
                          <span className="location-city">{property.area}</span>
                        </div>
                        <ScrollToButton
                          targetId="property-map"
                          block="center"
                          className="view-map-btn"
                        >
                          View on Map
                        </ScrollToButton>
                      </div>

                      <div className="property-price-block">
                        <span className="property-price">
                          {property.min_price || property.max_price
                            ? formatPriceRange(
                                property.min_price,
                                property.max_price
                              )
                            : formatPrice(property.price)}
                        </span>
                        {property.listing_type === "rent" && (
                          <span className="price-suffix">/month</span>
                        )}
                      </div>
                    </div>
                  </MotionSection>

                  <PropertySectionNavbar sections={sections} />

                  {/* Key Features */}
                  <MotionSection delay={0.3}>
                    <div id="overview">
                      <StaggerContainer className="key-features">

                        <StaggerItem>
                        <div className="key-feature">
                          <Maximize className="w-6 h-6 text-primary" />
                          <div>
                            <span className="feature-value">
                              {property.carpet_area || "N/A"}
                            </span>
                            <span className="feature-label">
                              {property.carpet_area ? "Area" : "Sq. Ft."}
                            </span>
                          </div>
                        </div>
                      </StaggerItem>
                      <StaggerItem>
                        <div className="key-feature">
                          <Building className="w-6 h-6 text-primary" />
                          <div>
                            <span className="feature-value">
                              {property.property_type}
                            </span>
                            <span className="feature-label">Type</span>
                          </div>
                        </div>
                      </StaggerItem>
                    </StaggerContainer>
                    </div>
                  </MotionSection>

                  {/* Description */}
                  <MotionSection delay={0.4}>
                    <div className="property-section" id="description">
                      <h2 className="section-heading">Description</h2>
                      <ReadMoreText text={property.description || ""} maxLength={250} />
                    </div>
                  </MotionSection>

                  {/* Project Overview */}
                  {(property.land_parcel ||
                    property.towers ||
                    property.floors ||
                    property.config ||
                    property.carpet_area ||
                    property.rera_no ||
                    property.possession_status ||
                    property.target_possession ||
                    property.litigation !== undefined) && (
                    <MotionSection delay={0.45}>
                      <div className="property-section" id="project-overview">
                        <h2 className="section-heading">Project Overview</h2>
                        <StaggerContainer
                          className="project-overview-grid"
                          fast
                        >
                          {property.land_parcel !== undefined &&
                            property.land_parcel > 0 && (
                              <StaggerItem>
                                <div className="project-overview-item">
                                  <div className="project-overview-icon">
                                    <LandPlot className="w-5 h-5" />
                                  </div>
                                  <div className="project-overview-content">
                                    <span className="project-overview-value">
                                      {property.land_parcel}
                                    </span>
                                    <span className="project-overview-label">
                                      Land Parcel
                                    </span>
                                  </div>
                                </div>
                              </StaggerItem>
                            )}
                          {property.towers !== undefined &&
                            property.towers > 0 && (
                              <StaggerItem>
                                <div className="project-overview-item">
                                  <div className="project-overview-icon">
                                    <TowerControl className="w-5 h-5" />
                                  </div>
                                  <div className="project-overview-content">
                                    <span className="project-overview-value">
                                      {property.towers}
                                    </span>
                                    <span className="project-overview-label">
                                      Towers
                                    </span>
                                  </div>
                                </div>
                              </StaggerItem>
                            )}
                          {property.floors && (
                            <StaggerItem>
                              <div className="project-overview-item">
                                <div className="project-overview-icon">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <div className="project-overview-content">
                                  <span className="project-overview-value">
                                    {property.floors}
                                  </span>
                                  <span className="project-overview-label">
                                    Floors
                                  </span>
                                </div>
                              </div>
                            </StaggerItem>
                          )}
                          {property.config && (
                            <StaggerItem>
                              <div className="project-overview-item">
                                <div className="project-overview-icon">
                                  <LayoutGrid className="w-5 h-5" />
                                </div>
                                <div className="project-overview-content">
                                  <span className="project-overview-value">
                                    {property.config}
                                  </span>
                                  <span className="project-overview-label">
                                    Config
                                  </span>
                                </div>
                              </div>
                            </StaggerItem>
                          )}
                          {property.carpet_area && (
                            <StaggerItem>
                              <div className="project-overview-item">
                                <div className="project-overview-icon">
                                  <Ruler className="w-5 h-5" />
                                </div>
                                <div className="project-overview-content">
                                  <span className="project-overview-value">
                                    {property.carpet_area}
                                  </span>
                                  <span className="project-overview-label">
                                    Carpet Area
                                  </span>
                                </div>
                              </div>
                            </StaggerItem>
                          )}
                          {property.rera_no && (
                            <StaggerItem>
                              <div className="project-overview-item">
                                <div className="project-overview-icon">
                                  <FileCheck className="w-5 h-5" />
                                </div>
                                <div className="project-overview-content">
                                  <span
                                    className="project-overview-value rera-number"
                                    title={property.rera_no}
                                  >
                                    {property.rera_no}
                                  </span>
                                  <span className="project-overview-label">
                                    RERA No.
                                  </span>
                                </div>
                              </div>
                            </StaggerItem>
                          )}
                          {property.possession_status && (
                            <StaggerItem>
                              <div className="project-overview-item">
                                <div className="project-overview-icon">
                                  <Building className="w-5 h-5" />
                                </div>
                                <div className="project-overview-content">
                                  <span className="project-overview-value">
                                    {property.possession_status}
                                  </span>
                                  <span className="project-overview-label">
                                    Possession Status
                                  </span>
                                </div>
                              </div>
                            </StaggerItem>
                          )}
                          {property.target_possession && (
                            <StaggerItem>
                              <div className="project-overview-item">
                                <div className="project-overview-icon">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div className="project-overview-content">
                                  <span className="project-overview-value">
                                    {property.target_possession}
                                  </span>
                                  <span className="project-overview-label">
                                    Target Possession
                                  </span>
                                </div>
                              </div>
                            </StaggerItem>
                          )}

                          <StaggerItem>
                            <div
                              className={`project-overview-item litigation-item ${
                                property.litigation
                                  ? "has-litigation"
                                  : "no-litigation"
                              }`}
                            >
                              <div className="project-overview-icon">
                                <Scale className="w-5 h-5" />
                              </div>
                              <div className="project-overview-content">
                                <span className="project-overview-value">
                                  {property.litigation ? "Yes" : "No"}
                                </span>
                                <span className="project-overview-label">
                                  Litigation
                                </span>
                              </div>
                            </div>
                          </StaggerItem>
                        </StaggerContainer>
                      </div>
                    </MotionSection>
                  )}

                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <MotionSection delay={0.5}>
                      <div className="property-section" id="amenities">
                        <h2 className="section-heading">Amenities</h2>
                        <StaggerContainer className="amenities-grid" fast>
                          {property.amenities.map((amenity: string) => {
                            const AmenityIcon = getAmenityIcon(amenity);
                            return (
                              <StaggerItem key={amenity}>
                                <div className="amenity-item">
                                  <AmenityIcon className="w-5 h-5 text-primary" />
                                  <span>{amenity}</span>
                                </div>
                              </StaggerItem>
                            );
                          })}
                        </StaggerContainer>
                      </div>
                    </MotionSection>
                  )}

                  {/* Floor Plan */}
                  {property.floor_plan_url && (
                    <MotionSection delay={0.51}>
                      <div className="property-section" id="floor-plan">
                        <h2 className="section-heading">Floor Plan</h2>
                        <div className="relative w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={property.floor_plan_url}
                            alt="Floor Plan"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                      </div>
                    </MotionSection>
                  )}

                  {/* Videos */}
                  {property.video_urls && property.video_urls.length > 0 && (
                    <MotionSection delay={0.515}>
                      <div className="property-section" id="videos">
                        <h2 className="section-heading">Videos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {property.video_urls.map((url, index) => (
                            <div key={index} className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                              <video
                                src={url}
                                className="w-full h-full object-contain"
                                controls
                                preload="metadata"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </MotionSection>
                  )}

                  {/* Brochure Download */}
                  {property.brochure_urls &&
                    property.brochure_urls.length > 0 && (
                      <MotionSection delay={0.52}>
                        <div className="property-section">
                          <h2 className="section-heading">Brochures</h2>
                          <div className="space-y-3">
                            {property.brochure_urls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="brochure-download-btn"
                              >
                                <FileDown className="w-5 h-5" />
                                <span>
                                  Download Brochure{" "}
                                  {property.brochure_urls!.length > 1
                                    ? index + 1
                                    : ""}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </MotionSection>
                    )}

                  {/* Inquiry CTA */}
                  <MotionSection delay={0.55}>
                    <InquiryCTA />
                  </MotionSection>

                  {/* Location Map */}
                  <MotionSection delay={0.6}>
                    <div id="property-map" className="property-section">
                      <h2 className="section-heading">Location</h2>
                      <div className="location-content">
                        <div className="location-text-block">
                          <p className="location-address-text">
                            <MapPin className="w-5 h-5 text-primary" />
                            {property.address}, {property.area}
                          </p>
                        </div>
                        <div className="location-map-container">
                          <iframe
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                              `${property.address}, ${property.area}, Pune, Maharashtra, India`
                            )}&output=embed`}
                            width="100%"
                            height="400"
                            style={{ border: 0, borderRadius: "12px" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map showing location of ${property.title}`}
                          />
                        </div>
                        <div className="location-inquiry-prompt">
                          <p>
                            For exact location details and site visit, please
                            send an inquiry or contact us directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </MotionSection>
                </div>

                {/* Sidebar */}
                <aside className="property-sidebar">
                  <MotionSection delay={0.3}>
                    <div className="sidebar-sticky">
                      {/* Contact Form */}
                      <ContactForm
                        propertyId={property.id}
                        propertyTitle={property.title}
                      />
                    </div>
                  </MotionSection>
                </aside>
              </div>
            </div>
          </section>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <MotionSection className="similar-section">
              <div className="container">
                <h2 className="section-title-new">Similar Properties</h2>
                <StaggerContainer className="similar-grid">
                  {similarProperties.map((prop) => (
                    <StaggerItem key={prop.id}>
                      <Link
                        href={`/properties/${prop.id}`}
                        className="similar-card"
                      >
                        <div className="similar-card-image">
                          {prop.images?.[0] && (
                            <Image
                              src={prop.images[0]}
                              alt={prop.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="similar-card-content">
                          <h3>{prop.title}</h3>
                          <p>{prop.area}</p>
                          <span className="similar-price">
                            {prop.min_price || prop.max_price
                              ? formatPriceRange(prop.min_price, prop.max_price)
                              : formatPrice(prop.price)}
                          </span>
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </MotionSection>
          )}
        </main>
      </PropertyDetailsClient>

      <Footer />
    </>
  );
}
