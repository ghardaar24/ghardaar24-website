import { supabase, Property } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import ContactForm from "@/components/ContactForm";
import InquiryCTA from "@/components/InquiryCTA";
import ScrollToButton from "@/components/ScrollToButton";
import { formatPrice } from "@/lib/utils";
import { generatePropertyMetadata, generatePropertySchema } from "@/lib/seo";
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

async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
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

  return (
    <>
      {/* JSON-LD Structured Data for Property */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generatePropertySchema(property)),
        }}
      />

      <Header />

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
                        {formatPrice(property.price)}
                      </span>
                      {property.listing_type === "rent" && (
                        <span className="price-suffix">/month</span>
                      )}
                    </div>
                  </div>
                </MotionSection>

                {/* Key Features */}
                <MotionSection delay={0.3}>
                  <StaggerContainer className="key-features">
                    <StaggerItem>
                      <div className="key-feature">
                        <Bed className="w-6 h-6 text-primary" />
                        <div>
                          <span className="feature-value">
                            {property.bedrooms}
                          </span>
                          <span className="feature-label">Bedrooms</span>
                        </div>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="key-feature">
                        <Bath className="w-6 h-6 text-primary" />
                        <div>
                          <span className="feature-value">
                            {property.bathrooms}
                          </span>
                          <span className="feature-label">Bathrooms</span>
                        </div>
                      </div>
                    </StaggerItem>
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
                </MotionSection>

                {/* Description */}
                <MotionSection delay={0.4}>
                  <div className="property-section">
                    <h2 className="section-heading">Description</h2>
                    <p className="property-description">
                      {property.description}
                    </p>
                  </div>
                </MotionSection>

                {/* Project Overview */}
                {(property.land_parcel || property.towers || property.floors || property.config || property.carpet_area || property.rera_no || property.possession_status || property.target_possession || property.litigation !== undefined) && (
                  <MotionSection delay={0.45}>
                    <div className="property-section">
                      <h2 className="section-heading">Project Overview</h2>
                      <StaggerContainer className="project-overview-grid" fast>
                        {property.land_parcel !== undefined && property.land_parcel > 0 && (
                          <StaggerItem>
                            <div className="project-overview-item">
                              <div className="project-overview-icon">
                                <LandPlot className="w-5 h-5" />
                              </div>
                              <div className="project-overview-content">
                                <span className="project-overview-value">{property.land_parcel}</span>
                                <span className="project-overview-label">Land Parcel</span>
                              </div>
                            </div>
                          </StaggerItem>
                        )}
                        {property.towers !== undefined && property.towers > 0 && (
                          <StaggerItem>
                            <div className="project-overview-item">
                              <div className="project-overview-icon">
                                <TowerControl className="w-5 h-5" />
                              </div>
                              <div className="project-overview-content">
                                <span className="project-overview-value">{property.towers}</span>
                                <span className="project-overview-label">Towers</span>
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
                                <span className="project-overview-value">{property.floors}</span>
                                <span className="project-overview-label">Floors</span>
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
                                <span className="project-overview-value">{property.config}</span>
                                <span className="project-overview-label">Config</span>
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
                                <span className="project-overview-value">{property.carpet_area}</span>
                                <span className="project-overview-label">Carpet Area</span>
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
                                <span className="project-overview-value rera-number" title={property.rera_no}>{property.rera_no}</span>
                                <span className="project-overview-label">RERA No.</span>
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
                                <span className="project-overview-value">{property.possession_status}</span>
                                <span className="project-overview-label">Possession Status</span>
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
                                <span className="project-overview-value">{property.target_possession}</span>
                                <span className="project-overview-label">Target Possession</span>
                              </div>
                            </div>
                          </StaggerItem>
                        )}

                        <StaggerItem>
                          <div className={`project-overview-item litigation-item ${property.litigation ? 'has-litigation' : 'no-litigation'}`}>
                            <div className="project-overview-icon">
                              <Scale className="w-5 h-5" />
                            </div>
                            <div className="project-overview-content">
                              <span className="project-overview-value">{property.litigation ? 'Yes' : 'No'}</span>
                              <span className="project-overview-label">Litigation</span>
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
                    <div className="property-section">
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

                {/* Brochure Download */}
                {property.brochure_url && (
                  <MotionSection delay={0.52}>
                    <div className="property-section">
                      <h2 className="section-heading">Brochure</h2>
                      <a
                        href={property.brochure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brochure-download-btn"
                      >
                        <FileDown className="w-5 h-5" />
                        <span>Download Property Brochure</span>
                      </a>
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
                    <div className="location-text-block">
                      <p className="location-address-text">
                        {property.address}, {property.area}
                      </p>
                      <div className="location-inquiry-prompt">
                        <p>
                          To view the exact location and get detailed
                          directions, please send an inquiry.
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
                          {formatPrice(prop.price)}
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

      <Footer />
    </>
  );
}
