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
import IntroTour from "@/components/IntroTour";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghardaar24 | Best Real Estate Agent in Pune | Zero Brokerage Properties",
  description:
    "Looking for flats in Pune? Ghardaar24 offers verified properties for sale and rent in Baner, Wakad, Hinjewadi & more with Zero Brokerage. Contact us now!",
  alternates: {
    canonical: "https://ghardaar24.com",
  },
};

async function getFeaturedProperties(): Promise<Property[]> {
  // Get only explicitly featured properties (approved ones)
  const { data: featured, error: featuredError } = await supabase
    .from("properties")
    .select("*")
    .eq("featured", true)
    .or("approval_status.eq.approved,approval_status.is.null")
    .order("created_at", { ascending: false })
    .limit(6);

  if (featuredError) {
    if (process.env.NODE_ENV === "development") console.error("Error fetching featured properties:", featuredError);
    return [];
  }

  return featured || [];
}

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <>
      <Header />
      <IntroTour />

      {/* Hero Section */}
      <section className="hero-v2">
        <div className="hero-v2-overlay" />
        <div className="hero-v2-grain" aria-hidden="true" />

        <div className="container hero-v2-container">
          <MotionSection className="hero-v2-content">
            <h1 className="hero-v2-heading">
              <span className="hero-v2-heading-line1">Where Every</span>
              <span className="hero-v2-heading-line2">Door Leads Home.</span>
            </h1>

            <p className="hero-v2-sub">
              Zero brokerage · Verified properties across Pune · 10+ years of trust
            </p>

            <div className="hero-v2-cta-group">
              <Link href="/properties" className="hero-v2-btn-primary">
                <Search className="w-5 h-5" />
                Browse Properties
              </Link>
              <Link href="#consultation" className="hero-v2-btn-ghost">
                Talk to an Expert
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="hero-v2-stats">
              <div className="hero-v2-stat">
                <span className="hero-v2-stat-num">500+</span>
                <span className="hero-v2-stat-label">Properties</span>
              </div>
              <div className="hero-v2-stat-divider" />
              <div className="hero-v2-stat">
                <span className="hero-v2-stat-num">100%</span>
                <span className="hero-v2-stat-label">Satisfaction</span>
              </div>
              <div className="hero-v2-stat-divider" />
              <div className="hero-v2-stat">
                <span className="hero-v2-stat-num">10+</span>
                <span className="hero-v2-stat-label">Years Trust</span>
              </div>
            </div>
          </MotionSection>

        </div>

        <div id="intro-search" className="hero-v2-search-wrapper">
          <HeroSearchBar />
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Featured Properties - Client Component with Login Modal */}
      <div id="intro-featured">
        <HomeClient featuredProperties={featuredProperties} />
      </div>

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Agent Profile */}
      {/* Agent Profile (includes contact form) */}
      <div id="intro-contact">
        <AgentProfile />
      </div>

      {/* CTA Section */}
      <MotionSection className="cta-v2">
        <div className="cta-v2-glow" aria-hidden="true" />
        <div className="container">
          <StaggerContainer className="cta-v2-inner">
            <StaggerItem>
              <span className="cta-v2-eyebrow">Your New Home Awaits</span>
            </StaggerItem>
            <StaggerItem>
              <h2 className="cta-v2-title">
                Ready to Find Your<br />Perfect Home?
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className="cta-v2-sub">
                Verified properties · Zero brokerage · Expert guidance every step of the way
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="cta-v2-buttons">
                <Link href="/properties" className="cta-v2-btn-primary">
                  Browse Properties
                </Link>
                <Link href="/properties?listing_type=rent" className="cta-v2-btn-outline">
                  Explore Rentals
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </MotionSection>

      <Footer />
    </>
  );
}
