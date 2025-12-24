import { supabase, Property } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import ContactForm from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";
import InquiryCTA from "@/components/InquiryCTA";
import { formatPrice } from "@/lib/utils";
import { generatePropertyMetadata } from "@/lib/seo";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
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
    .eq("city", property.city)
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
                        <span className="location-city">{property.city}</span>
                      </div>
                      <button
                        onClick={() => {
                          document
                            .getElementById("property-map")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }}
                        className="view-map-btn"
                      >
                        View on Map
                      </button>
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
                        <Bed className="w-6 h-6" />
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
                        <Bath className="w-6 h-6" />
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
                        <Maximize className="w-6 h-6" />
                        <div>
                          <span className="feature-value">
                            {property.area_sqft.toLocaleString()}
                          </span>
                          <span className="feature-label">Sq. Ft.</span>
                        </div>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="key-feature">
                        <Building className="w-6 h-6" />
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

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <MotionSection delay={0.5}>
                    <div className="property-section">
                      <h2 className="section-heading">Amenities</h2>
                      <StaggerContainer className="amenities-grid" fast>
                        {property.amenities.map((amenity: string) => (
                          <StaggerItem key={amenity}>
                            <div className="amenity-item">
                              <CheckCircle className="w-5 h-5" />
                              <span>{amenity}</span>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
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
                        {property.address}, {property.city}
                      </p>
                      <div className="location-inquiry-prompt">
                        <p>
                          To view the exact location and get detailed
                          directions, please send an inquiry.
                        </p>
                        <button
                          onClick={() => {
                            document
                              .getElementById("contact-form")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="view-map-btn"
                        >
                          Send Inquiry for Location
                        </button>
                      </div>
                    </div>
                  </div>
                </MotionSection>
              </div>

              {/* Sidebar */}
              <aside className="property-sidebar">
                <MotionSection delay={0.3}>
                  <div className="sidebar-sticky">
                    {/* Price Card */}
                    <div className="price-card">
                      <div className="price-card-header">
                        <span className="price-card-price">
                          {formatPrice(property.price)}
                        </span>
                        {property.listing_type === "rent" && (
                          <span className="price-card-suffix">/month</span>
                        )}
                      </div>
                      <div className="price-card-meta">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Listed{" "}
                          {new Date(property.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Contact Form */}
                    <ContactForm
                      propertyId={property.id}
                      propertyTitle={property.title}
                    />

                    {/* Share & Save */}
                    <div className="action-buttons">
                      <button className="action-btn">
                        <Share2 className="w-5 h-5" />
                        Share
                      </button>
                      <button className="action-btn">
                        <Heart className="w-5 h-5" />
                        Save
                      </button>
                    </div>
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
                          <img src={prop.images[0]} alt={prop.title} />
                        )}
                      </div>
                      <div className="similar-card-content">
                        <h3>{prop.title}</h3>
                        <p>{prop.city}</p>
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
