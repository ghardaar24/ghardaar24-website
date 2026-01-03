import { supabase, Property } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicators from "@/components/TrustIndicators";
import WhyChooseUs from "@/components/WhyChooseUs";
import AgentProfile from "@/components/AgentProfile";

import HomeClient, { HeroSearchBar } from "@/components/HomeClient";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { MotionSection, StaggerContainer, StaggerItem } from "@/lib/motion";

async function getFeaturedProperties(): Promise<Property[]> {
  // First try to get explicitly featured properties (only approved ones)
  const { data: featured, error: featuredError } = await supabase
    .from("properties")
    .select("*")
    .eq("featured", true)
    .or("approval_status.eq.approved,approval_status.is.null")
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

  // Fallback: Get latest approved properties if no featured ones exist
  const { data: latest, error: latestError } = await supabase
    .from("properties")
    .select("*")
    .or("approval_status.eq.approved,approval_status.is.null")
    .order("created_at", { ascending: false })
    .limit(6);

  if (latestError) {
    console.error("Error fetching latest properties:", latestError);
    return [];
  }

  // Return fallback properties without marking them as featured
  return latest || [];
}

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
                <span className="hero-title-gradient">Ghardaar 24</span>
              </h1>
              <p className="hero-subtitle-new hero-subtitle-light !text-xl md:!text-2xl !font-semibold !mb-3">
                Where Every Door Leads Home.
              </p>
              <p className="hero-subtitle-new hero-subtitle-light !mt-0">
                Elevating the Art of Fine Living.
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
                  <span className="hero-trust-value">100%</span>
                  <span className="hero-trust-label">Satisfaction</span>
                </div>
                <div className="hero-trust-divider" />
                <div className="hero-trust-item">
                  <span className="hero-trust-value">10+</span>
                  <span className="hero-trust-label">Years Trust</span>
                </div>
              </div>
            </MotionSection>
          </div>

          {/* Hero Search Bar with Login Modal */}
          <HeroSearchBar />
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Featured Properties - Client Component with Login Modal */}
      <HomeClient featuredProperties={featuredProperties} />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Agent Profile */}
      {/* Agent Profile (includes contact form) */}
      <AgentProfile />

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
