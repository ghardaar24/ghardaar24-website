"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import Image from "next/image";
import { Property, supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Building,
  Maximize,
  MapPin,
  ChevronRight,
  Home,
  Castle,
  Ruler,
  Store,
  Wallet,
  Building2,
  Tag,
} from "lucide-react";
import {
  MotionSection,
  StaggerContainer,
  StaggerItem,
  motion,
} from "@/lib/motion";
import { ReactNode } from "react";

interface HomeClientProps {
  featuredProperties: Property[];
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

// Custom Property Card for Home Page with login check
function HomePropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const router = useRouter();
  const mainImage = property.images?.[0] || "/placeholder-property.jpg";
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    router.push(`/properties/${property.id}`);
  };

  const badgeLabel =
    property.listing_type === "sale"
      ? "For Sale"
      : property.listing_type === "resale"
      ? "Resale"
      : "For Rent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.1, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="prop-card-v2" onClick={handleClick}>
        {/* Full-bleed image */}
        <div className="prop-card-v2-image">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
          )}
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className={`object-cover transition-all duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            loading={index < 3 ? "eager" : "lazy"}
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="prop-card-v2-gradient" />

        {/* Badges top-left */}
        <div className="prop-card-v2-badges">
          <span className={`prop-card-v2-badge ${property.listing_type}`}>
            {badgeLabel}
          </span>
          {property.featured && (
            <span className="prop-card-v2-badge featured">Featured</span>
          )}
        </div>

        {/* Content overlay at bottom */}
        <div className="prop-card-v2-body">
          <div className="prop-card-v2-location">
            <MapPin className="w-3 h-3" />
            <span>{property.area}</span>
          </div>
          <h3 className="prop-card-v2-title">{property.title}</h3>
          <div className="prop-card-v2-footer">
            <span className="prop-card-v2-price">
              {formatPrice(property.price)}
              {property.listing_type === "rent" && (
                <span className="text-xs font-normal opacity-70">/mo</span>
              )}
            </span>
            {property.carpet_area && (
              <span className="prop-card-v2-area">
                <Maximize className="w-3 h-3" />
                {property.carpet_area}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeClient({ featuredProperties }: HomeClientProps) {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/properties");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const isReady = mounted && !loading;

  const handleLoginRequired = (redirectUrl: string) => {
    setPendingRedirect(redirectUrl);
    setShowLoginModal(true);
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    if (!isReady) return;

    if (!user) {
      e.preventDefault();
      handleLoginRequired(url);
    }
  };

  // Show skeleton state while not mounted/loading
  if (!mounted) {
    return (
      <>
        {featuredProperties.length > 0 && (
          <section className="featured-v2">
            <div className="container">
              <div className="featured-v2-header">
                <div className="featured-v2-title-block">
                  <div className="w-28 h-3 bg-neutral-200 rounded animate-pulse mb-2" />
                  <div className="w-48 h-8 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="properties-grid">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="prop-card-v2 animate-pulse"
                    style={{ background: "#e5e7eb" }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }

  // Show loading state while auth is initializing
  if (!isReady) {
    return (
      <>
        {featuredProperties.length > 0 && (
          <MotionSection className="featured-v2">
            <div className="container">
              <div className="featured-v2-header">
                <div className="featured-v2-title-block">
                  <span className="featured-v2-eyebrow">Handpicked for You</span>
                  <h2 className="featured-v2-title">Featured Properties</h2>
                </div>
              </div>
              <div className="properties-grid">
                {featuredProperties.map((property, index) => (
                  <HomePropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            </div>
          </MotionSection>
        )}

        <MotionSection className="types-v2">
          <div className="container">
            <div className="section-header section-header-center">
              <h2 className="featured-v2-title">Browse by Property Type</h2>
            </div>
            <div className="types-v2-grid">
              {propertyTypes.map((item) => (
                <div key={item.type} className="type-card-v2">
                  <span className="type-card-v2-icon">{item.icon}</span>
                  <span className="type-card-v2-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>
      </>
    );
  }

  return (
    <>
      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <MotionSection className="featured-v2">
          <div className="container">
            <div className="featured-v2-header">
              <div className="featured-v2-title-block">
                <span className="featured-v2-eyebrow">Handpicked for You</span>
                <h2 className="featured-v2-title">Featured Properties</h2>
              </div>
              <Link href="/properties?featured=true" className="btn-outline-new">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="properties-grid">
              {featuredProperties.map((property, index) => (
                <HomePropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {/* Property Types */}
      <MotionSection className="types-v2">
        <div className="container">
          <StaggerContainer className="section-header section-header-center">
            <StaggerItem>
              <span className="featured-v2-eyebrow">Explore</span>
            </StaggerItem>
            <StaggerItem>
              <h2 className="featured-v2-title">Browse by Property Type</h2>
            </StaggerItem>
          </StaggerContainer>

          <StaggerContainer className="types-v2-grid">
            {propertyTypes.map((item) => (
              <StaggerItem key={item.type}>
                <Link
                  href={`/properties?type=${item.type}`}
                  className="type-card-v2"
                  onClick={(e) =>
                    handleLinkClick(e, `/properties?type=${item.type}`)
                  }
                >
                  <span className="type-card-v2-icon">{item.icon}</span>
                  <span className="type-card-v2-label">{item.label}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={pendingRedirect}
        title="Login to Continue"
        subtitle="Please login to browse properties and view details"
      />
    </>
  );
}

// Export HeroSearchBar as a separate component
export function HeroSearchBar() {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/properties");
  const [locations, setLocations] = useState<{ state: string; city: string }[]>(
    []
  );
  const [selectedCity, setSelectedCity] = useState("");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from("locations")
        .select("state, city")
        .eq("is_active", true);
      if (data) setLocations(data);
    }
    fetchLocations();
  }, []);

  const availableCities = Array.from(
    new Set(locations.map((l) => l.city))
  ).sort();

  // Use router for navigation
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mounted || loading) return;

    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);

    const formData = new FormData(e.currentTarget);

    const budget = formData.get("budget") as string;
    if (budget) {
      const [min, max] = budget.split("-");
      if (min) params.set("min_price", min);
      if (max) params.set("max_price", max);
    }
    formData.delete("budget");

    formData.forEach((value, key) => {
      if (value && value !== "") params.append(key, value.toString());
    });

    const url = `/properties?${params.toString()}`;

    if (!user) {
      setPendingRedirect(url);
      setShowLoginModal(true);
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <MotionSection className="hero-search hero-search-horizontal" delay={0.4}>
        <form
          action="/properties"
          className="search-form search-form-horizontal"
          onSubmit={handleSubmit}
        >
          <div className="search-filter">
            <span className="search-filter-label">City</span>
            <div className="search-filter-value">
              <MapPin className="w-4 h-4" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-filter">
            <span className="search-filter-label">Type</span>
            <div className="search-filter-value">
              <Building className="w-4 h-4" />
              <select name="property_type" defaultValue="">
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
              </select>
            </div>
          </div>

          <div className="search-filter">
            <span className="search-filter-label">Listing</span>
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
            <span className="search-filter-label">Budget</span>
            <div className="search-filter-value">
              <Wallet className="w-4 h-4" />
              <select name="budget" defaultValue="">
                <option value="">Any</option>
                <option value="7500000-10000000">₹75L-1Cr</option>
                <option value="10000000-15000000">₹1Cr-1.5Cr</option>
                <option value="15000000-25000000">₹1.5Cr-2.5Cr</option>
                <option value="25000000-">₹2.5Cr+</option>
              </select>
            </div>
          </div>

          <button type="submit" className="search-button">
            <Search className="w-5 h-5" />
            Search Properties
          </button>
        </form>
      </MotionSection>

      {/* Login Modal for Search */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={pendingRedirect}
        title="Login to Search"
        subtitle="Please login to search and browse properties"
      />
    </>
  );
}
