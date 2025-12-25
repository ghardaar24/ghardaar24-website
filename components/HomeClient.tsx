"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/lib/supabase";
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
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="property-card-new group"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <motion.div
          className="property-card-image-new"
          whileHover={{ scale: 1 }}
        >
          <motion.div
            className="w-full h-full relative"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>
          <div className="property-card-badges">
            <motion.span
              className={`property-badge-new ${
                property.listing_type === "sale"
                  ? "sale"
                  : property.listing_type === "resale"
                  ? "resale"
                  : "rent"
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {property.listing_type === "sale"
                ? "For Sale"
                : property.listing_type === "resale"
                ? "Resale"
                : "For Rent"}
            </motion.span>
            {property.featured && (
              <motion.span
                className="property-badge-new featured"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                Featured
              </motion.span>
            )}
          </div>
        </motion.div>

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
  const [isReady, setIsReady] = useState(false);

  // Wait for auth to be ready before showing interactive elements
  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

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

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (loading) return;

    if (!user) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const params = new URLSearchParams();

      formData.forEach((value, key) => {
        if (value && value !== "") {
          params.append(key, value.toString());
        }
      });

      setPendingRedirect(
        `/properties${params.toString() ? `?${params.toString()}` : ""}`
      );
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <MotionSection className="hero-search hero-search-horizontal" delay={0.4}>
        <form
          action="/properties"
          className="search-form search-form-horizontal"
          onSubmit={handleSearchSubmit}
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
                <option value="7500000-10000000">₹75L-1Cr</option>
                <option value="10000000-15000000">₹1Cr-1.5Cr</option>
                <option value="15000000-25000000">₹1.5Cr-2.5Cr</option>
                <option value="25000000-">₹2.5Cr+</option>
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
