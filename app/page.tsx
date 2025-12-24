import { supabase, Property } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import TrustIndicators from "@/components/TrustIndicators";
import WhyChooseUs from "@/components/WhyChooseUs";

import PopularLocalities from "@/components/PopularLocalities";
import AgentProfile from "@/components/AgentProfile";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import EMICalculator from "@/components/EMICalculator";
import Link from "next/link";
import {
  Search,
  MapPin,
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
      <section className="hero-new">
        <div className="hero-bg-elements">
          <div className="hero-bg-circle hero-bg-circle-1" />
          <div className="hero-bg-circle hero-bg-circle-2" />
          <div className="hero-bg-circle hero-bg-circle-3" />
        </div>

        <div className="container hero-content-new">
          <div className="hero-main">
            <MotionSection className="hero-text-new">
              <h1 className="hero-title-new">
                Find Your Perfect
                <span className="hero-title-gradient"> Dream Home</span>
              </h1>
              <p className="hero-subtitle-new">
                Discover 500+ verified properties in Pune and nearby areas. Zero
                brokerage, 100% transparency, and expert guidance every step of
                the way.
              </p>

              <div className="hero-cta-group">
                <Link href="/properties" className="hero-btn-primary">
                  <Search className="w-5 h-5" />
                  Browse Properties
                </Link>
                <Link
                  href="/properties?listing_type=rent"
                  className="hero-btn-secondary"
                >
                  Explore Rentals
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="hero-trust-badges">
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

            <StaggerContainer className="hero-visual">
              <StaggerItem>
                <div className="hero-visual-main">
                  <div className="hero-visual-card">
                    <div className="hero-visual-icon">
                      <Home className="w-6 h-6" />
                    </div>
                    <div className="hero-visual-content">
                      <span className="hero-visual-title">
                        Premium Properties
                      </span>
                      <span className="hero-visual-desc">
                        Handpicked luxury homes
                      </span>
                    </div>
                  </div>
                  <div className="hero-visual-card">
                    <div className="hero-visual-icon">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="hero-visual-content">
                      <span className="hero-visual-title">Prime Locations</span>
                      <span className="hero-visual-desc">
                        Pune & Outskirts covered
                      </span>
                    </div>
                  </div>
                  <div className="hero-visual-card">
                    <div className="hero-visual-icon">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="hero-visual-content">
                      <span className="hero-visual-title">
                        Verified Listings
                      </span>
                      <span className="hero-visual-desc">
                        100% genuine properties
                      </span>
                    </div>
                  </div>
                  <div className="hero-visual-card">
                    <div className="hero-visual-icon">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="hero-visual-content">
                      <span className="hero-visual-title">Zero Brokerage</span>
                      <span className="hero-visual-desc">
                        Save lakhs on fees
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Search Bar */}
          <MotionSection className="hero-search" delay={0.4}>
            <form action="/properties" className="search-form">
              <div className="search-filter">
                <span className="search-filter-label">Location</span>
                <div className="search-filter-value">
                  <MapPin className="w-4 h-4" />
                  <select name="city" defaultValue="">
                    <option value="">All Locations</option>
                    <option value="Pune">Pune</option>
                    <option value="Pimpri-Chinchwad">Pimpri-Chinchwad</option>
                    <option value="Hinjewadi">Hinjewadi</option>
                    <option value="Wakad">Wakad</option>
                    <option value="Baner">Baner</option>
                    <option value="Kharadi">Kharadi</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">Property type</span>
                <div className="search-filter-value">
                  <Building className="w-4 h-4" />
                  <select name="type" defaultValue="">
                    <option value="">All Types</option>
                    <option value="apartment">Apartments</option>
                    <option value="house">Houses</option>
                    <option value="villa">Villas</option>
                    <option value="plot">Plots</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">Price</span>
                <div className="search-filter-value">
                  <DollarSign className="w-4 h-4" />
                  <select name="price_range" defaultValue="">
                    <option value="">Any Price</option>
                    <option value="0-2500000">Under ₹25L</option>
                    <option value="2500000-5000000">₹25L - ₹50L</option>
                    <option value="5000000-10000000">₹50L - ₹1Cr</option>
                    <option value="10000000-">Above ₹1Cr</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">Possession</span>
                <div className="search-filter-value">
                  <Calendar className="w-4 h-4" />
                  <select name="possession" defaultValue="">
                    <option value="">Any</option>
                    <option value="Immediate">Immediate</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>

              <div className="search-filter">
                <span className="search-filter-label">Bedrooms</span>
                <div className="search-filter-value">
                  <Bed className="w-4 h-4" />
                  <select name="bedrooms" defaultValue="">
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="search-button">
                <Search className="w-5 h-5" />
                Search
              </button>
            </form>
          </MotionSection>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Why Choose Us */}
      <WhyChooseUs />

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

      {/* Popular Localities */}
      <PopularLocalities />

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

      {/* EMI Calculator */}
      <EMICalculator />

      {/* Agent Profile */}
      <AgentProfile />

      {/* Lead Capture Form */}
      <LeadCaptureForm />

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
