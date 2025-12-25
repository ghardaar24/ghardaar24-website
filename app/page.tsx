import { supabase, Property } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import TrustIndicators from "@/components/TrustIndicators";
import WhyChooseUs from "@/components/WhyChooseUs";
import AgentProfile from "@/components/AgentProfile";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import Link from "next/link";
import {
  Search,
  Building,
  Bed,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Home,
  Castle,
  Ruler,
  Store,
  Wallet,
  Building2,
  Calendar,
  BookOpen,
  Tag,
} from "lucide-react";
import { MotionSection, StaggerContainer, StaggerItem } from "@/lib/motion";
import { ReactNode } from "react";

async function getFeaturedProperties(): Promise<Property[]> {
  // First try to get explicitly featured properties
  const { data: featured, error: featuredError } = await supabase
    .from("properties")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (featuredError) {
    console.error("Error fetching featured properties:", featuredError);
    return [];
  }

  // If we have featured properties, return them
  if (featured && featured.length > 0) {
    return featured;
  }

  // Fallback: Get latest properties if no featured ones exist
  const { data: latest, error: latestError } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  if (latestError) {
    console.error("Error fetching latest properties:", latestError);
    return [];
  }

  // Mark fallback properties as featured for display purposes
  return latest?.map((prop) => ({ ...prop, featured: true })) || [];
}

const propertyTypes: { type: string; label: string; icon: ReactNode }[] = [
  {
    type: "apartment",
    label: "Apartments",
    icon: <Building2 className="w-6 h-6" />,
  },
  { type: "house", label: "Houses", icon: <Home className="w-6 h-6" /> },
  { type: "villa", label: "Villas", icon: <Castle className="w-6 h-6" /> },
  { type: "plot", label: "Plots", icon: <Ruler className="w-6 h-6" /> },
  {
    type: "commercial",
    label: "Commercial",
    icon: <Store className="w-6 h-6" />,
  },
];

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="hero-new hero-with-bg">
        <div className="hero-overlay" />

        <div className="container hero-content-new">
          <div className="hero-main hero-centered">
            <MotionSection className="hero-text-new">
              <h1 className="hero-title-new hero-title-light">
                Find Your Perfect Home
                <span className="hero-title-gradient">in Pune</span>
              </h1>
              <p className="hero-subtitle-new hero-subtitle-light">
                Verified properties • Zero brokerage • Expert guidance
              </p>

              <div className="hero-cta-group">
                <Link href="/properties" className="hero-btn-primary">
                  <Search className="w-5 h-5" />
                  Browse Properties
                </Link>
                <Link
                  href="#consultation"
                  className="hero-btn-secondary hero-btn-light"
                >
                  Talk to an Expert
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="hero-trust-badges hero-trust-light">
                <div className="hero-trust-item">
                  <span className="hero-trust-value">500+</span>
                  <span className="hero-trust-label">Properties</span>
                </div>
                <div className="hero-trust-divider" />
                <div className="hero-trust-item">
                  <span className="hero-trust-value">1000+</span>
                  <span className="hero-trust-label">Happy Clients</span>
                </div>
                <div className="hero-trust-divider" />
                <div className="hero-trust-item">
                  <span className="hero-trust-value">10+</span>
                  <span className="hero-trust-label">Years Trust</span>
                </div>
              </div>
            </MotionSection>
          </div>

          {/* Horizontal Search Bar */}
          <MotionSection
            className="hero-search hero-search-horizontal"
            delay={0.4}
          >
            <form
              action="/properties"
              className="search-form search-form-horizontal"
            >
              <div className="search-filter">
                <span className="search-filter-label">Type</span>
                <div className="search-filter-value">
                  <Building className="w-4 h-4" />
                  <select name="type" defaultValue="">
                    <option value="">All</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">BHK</span>
                <div className="search-filter-value">
                  <Bed className="w-4 h-4" />
                  <select name="bedrooms" defaultValue="">
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">Budget</span>
                <div className="search-filter-value">
                  <Wallet className="w-4 h-4" />
                  <select name="price_range" defaultValue="">
                    <option value="">Any</option>
                    <option value="0-2500000">Under ₹25L</option>
                    <option value="2500000-5000000">₹25L-50L</option>
                    <option value="5000000-10000000">₹50L-1Cr</option>
                    <option value="10000000-">₹1Cr+</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">For</span>
                <div className="search-filter-value">
                  <Tag className="w-4 h-4" />
                  <select name="listing_type" defaultValue="">
                    <option value="">All</option>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                    <option value="resale">Resale</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">Possession</span>
                <div className="search-filter-value">
                  <Calendar className="w-4 h-4" />
                  <select name="possession" defaultValue="">
                    <option value="">Any</option>
                    <option value="ready">Ready</option>
                    <option value="under_construction">Building</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="search-button">
                <Search className="w-5 h-5" />
                Search Properties
              </button>
            </form>
          </MotionSection>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <MotionSection className="section featured-section-new">
          <div className="container">
            <StaggerContainer className="section-header">
              <StaggerItem>
                <h2 className="section-title-new">Featured Properties</h2>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/properties?featured=true"
                  className="btn-outline-new"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </StaggerItem>
            </StaggerContainer>

            <div className="properties-grid">
              {featuredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Property Types */}
      <MotionSection className="section types-section">
        <div className="container">
          <StaggerContainer className="section-header">
            <StaggerItem>
              <h2 className="section-title-new">Browse by Property Type</h2>
            </StaggerItem>
          </StaggerContainer>

          <StaggerContainer className="types-grid">
            {propertyTypes.map((item) => (
              <StaggerItem key={item.type}>
                <Link
                  href={`/properties?type=${item.type}`}
                  className="type-card-new"
                >
                  <span className="type-icon">{item.icon}</span>
                  <span className="type-label">{item.label}</span>
                  <ArrowRight className="w-4 h-4 type-arrow" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* Agent Profile */}
      <AgentProfile />

      {/* Lead Capture Form */}
      <div id="consultation">
        <LeadCaptureForm />
      </div>

      {/* CTA Section */}
      <MotionSection className="section cta-section-new">
        <div className="container">
          <StaggerContainer>
            <StaggerItem>
              <div className="cta-card-new">
                <div className="cta-content">
                  <h2>Ready to find your perfect home?</h2>
                  <p>Browse thousands of verified properties across India</p>
                </div>
                <div className="cta-actions">
                  <Link href="/properties" className="btn-primary-new">
                    Browse Properties
                  </Link>
                  <Link
                    href="/properties?listing_type=rent"
                    className="btn-secondary-new"
                  >
                    Explore Rentals
                  </Link>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </MotionSection>

      <Footer />
    </>
  );
}
