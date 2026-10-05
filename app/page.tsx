import { supabase, Property, PUBLIC_PROPERTY_COLUMNS } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicators from "@/components/TrustIndicators";
import WhyChooseUs from "@/components/WhyChooseUs";
import AgentProfile from "@/components/AgentProfile";

import HomeClient, { HeroSearchBar } from "@/components/HomeClient";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";
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
    .select(PUBLIC_PROPERTY_COLUMNS)
    .eq("featured", true)
    .or("approval_status.eq.approved,approval_status.is.null")
    .order("created_at", { ascending: false })
    .limit(6);

  if (featuredError) {
    if (process.env.NODE_ENV === "development") console.error("Error fetching featured properties:", featuredError);
    return [];
  }

  return (featured as unknown as Property[]) || [];
}

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <>
      <Header />
      <IntroTour />

      {/* Hero Section */}
      <section className="hero-v2">
        <div className="container hero-v2-container">
          <div className="hero-v2-content">
            <p className="hero-v2-eyebrow">Pune homes · Zero brokerage</p>

            <h1 className="hero-v2-heading">
              <span>Where every door</span>
              <em>leads home.</em>
            </h1>

            <p className="hero-v2-sub">
              Verified flats and villas to buy or rent, shown by an agent who has
              worked Pune&apos;s neighbourhoods for 10+ years. You pay no brokerage.
            </p>

            <div className="hero-v2-cta-group">
              <Link href="/properties" className="hero-v2-btn-primary">
                <Search className="w-5 h-5" />
                Browse properties
              </Link>
              <Link href="#consultation" className="hero-v2-btn-ghost">
                Talk to an expert
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <p className="hero-v2-areas-label" id="hero-areas-label">Popular areas</p>
            <ul className="hero-v2-areas" aria-labelledby="hero-areas-label">
              {["Baner", "Wakad", "Hinjewadi", "Kharadi", "Hadapsar"].map((area) => (
                <li key={area}>
                  <Link href={`/properties?search=${area}`}>{area}</Link>
                </li>
              ))}
            </ul>
          </div>

          <figure className="hero-v2-tower">
            <Image
              src="/hero.png"
              alt="Residential towers and villas at dusk with lit windows, palms and landscaped gardens"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="hero-v2-tower-img"
            />
            <figcaption className="hero-v2-tower-tag">
              <strong>500+</strong> verified homes
            </figcaption>
          </figure>
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
      <section className="cta-v2">
        <div className="container cta-v2-inner">
          <h2 className="cta-v2-title">
            Find your home in Pune,
            <em>without paying brokerage.</em>
          </h2>
          <div className="cta-v2-buttons">
            <Link href="/properties" className="cta-v2-btn-primary">
              Browse properties
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/properties?listing_type=rent" className="cta-v2-btn-outline">
              Explore rentals
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
