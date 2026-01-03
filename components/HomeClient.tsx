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
  Bed,
  Bath,
  Maximize,
  MapPin,
  ChevronRight,
  ArrowRight,
  Home,
  Castle,
  Ruler,
  Store,
  Wallet,
  Building2,
  Calendar,
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
  onLoginRequired,
  isLoggedIn,
}: {
  property: Property;
  index?: number;
  onLoginRequired: (redirectUrl: string) => void;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const mainImage = property.images?.[0] || "/placeholder-property.jpg";
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      onLoginRequired(`/properties/${property.id}`);
    } else {
      router.push(`/properties/${property.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ height: "100%" }}
    >
      <div
        className="property-card-new group"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <div className="property-card-image-new">
          <div className="w-full h-full relative">
            {!imageLoaded && (
              <div
                className="absolute inset-0 skeleton"
                style={{ background: "var(--gray-100)" }}
              />
            )}
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              loading={index < 3 ? "eager" : "lazy"}
            />
          </div>
          <div className="property-card-badges">
            <span
              className={`property-badge-new ${
                property.listing_type === "sale"
                  ? "sale"
                  : property.listing_type === "resale"
                  ? "resale"
                  : "rent"
              }`}
            >
              {property.listing_type === "sale"
                ? "For Sale"
                : property.listing_type === "resale"
                ? "Resale"
                : "For Rent"}
            </span>
            {property.featured && (
              <span className="property-badge-new featured">Featured</span>
            )}
          </div>
        </div>

        <div className="property-card-body">
          <div className="property-card-location">
            <MapPin className="w-3.5 h-3.5" />
            <span>{property.area}</span>
          </div>

          <h3 className="property-card-title">{property.title}</h3>

          <div className="property-card-features-new">
            <div className="feature-item-new">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="feature-item-new">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="feature-item-new">
              <Maximize className="w-4 h-4" />
              <span>{property.carpet_area || "N/A"}</span>
            </div>
          </div>

          <div className="property-card-footer">
            <span className="property-card-price">
              {formatPrice(property.price)}
              {property.listing_type === "rent" && (
                <span className="price-period">/mo</span>
              )}
            </span>
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
        {/* Featured Properties Skeleton */}
        {featuredProperties.length > 0 && (
          <section className="section featured-section-new">
            <div className="container">
              <div className="section-header">
                <div
                  className="skeleton-title"
                  style={{
                    width: "200px",
                    height: "32px",
                    background: "var(--gray-200)",
                    borderRadius: "var(--radius)",
                    animation: "pulse 2s infinite",
                  }}
                />
              </div>
              <div className="properties-grid">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="property-card-skeleton"
                    style={{
                      background: "white",
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        height: "220px",
                        background: "var(--gray-100)",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <div style={{ padding: "1.5rem" }}>
                      <div
                        style={{
                          width: "60%",
                          height: "14px",
                          background: "var(--gray-200)",
                          borderRadius: "var(--radius)",
                          marginBottom: "0.75rem",
                          animation: "pulse 2s infinite",
                        }}
                      />
                      <div
                        style={{
                          width: "100%",
                          height: "20px",
                          background: "var(--gray-200)",
                          borderRadius: "var(--radius)",
                          marginBottom: "1rem",
                          animation: "pulse 2s infinite",
                        }}
                      />
                      <div
                        style={{
                          width: "80%",
                          height: "16px",
                          background: "var(--gray-200)",
                          borderRadius: "var(--radius)",
                          animation: "pulse 2s infinite",
                        }}
                      />
                    </div>
                  </div>
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
        {/* Featured Properties Skeleton */}
        {featuredProperties.length > 0 && (
          <MotionSection className="section featured-section-new">
            <div className="container">
              <StaggerContainer className="section-header">
                <StaggerItem>
                  <h2 className="section-title-new">Featured Properties</h2>
                </StaggerItem>
              </StaggerContainer>

              <div className="properties-grid">
                {featuredProperties.map((property, index) => (
                  <HomePropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    onLoginRequired={handleLoginRequired}
                    isLoggedIn={false}
                  />
                ))}
              </div>
            </div>
          </MotionSection>
        )}

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
                  <div className="type-card-new" style={{ cursor: "pointer" }}>
                    <span className="type-icon">{item.icon}</span>
                    <span className="type-label">{item.label}</span>
                    <ArrowRight className="w-4 h-4 type-arrow" />
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </MotionSection>
      </>
    );
  }

  return (
    <>
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
                  onClick={(e) =>
                    handleLinkClick(e, "/properties?featured=true")
                  }
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </StaggerItem>
            </StaggerContainer>

            <div className="properties-grid">
              {featuredProperties.map((property, index) => (
                <HomePropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  onLoginRequired={handleLoginRequired}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </div>
        </MotionSection>
      )}

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
                  onClick={(e) =>
                    handleLinkClick(e, `/properties?type=${item.type}`)
                  }
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
