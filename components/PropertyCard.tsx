"use client";

import Image from "next/image";
import Link from "next/link";
import { Maximize, MapPin } from "lucide-react";
import { Property } from "@/lib/supabase";
import { formatPrice, formatPriceRange } from "@/lib/utils";
import { motion } from "@/lib/motion";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({
  property,
  index = 0,
}: PropertyCardProps) {
  const mainImage = property.images?.[0] || "/placeholder-property.svg";

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
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.16),
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ height: "100%" }}
    >
      <Link href={`/properties/${property.id}`} className="prop-card-v2">
        <div className="prop-card-v2-image">
          <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading={index < 3 ? "eager" : "lazy"}
          />
        </div>

        <div className="prop-card-v2-gradient" />

        <div className="prop-card-v2-badges">
          <span className={`prop-card-v2-badge ${property.listing_type}`}>
            {badgeLabel}
          </span>
          {property.featured && (
            <span className="prop-card-v2-badge featured">Featured</span>
          )}
        </div>

        <div className="prop-card-v2-body">
          <div className="prop-card-v2-location">
            <MapPin className="w-3 h-3" />
            <span>{property.area}</span>
          </div>
          <h3 className="prop-card-v2-title">{property.title}</h3>
          <div className="prop-card-v2-footer">
            <span className="prop-card-v2-price">
              {property.min_price || property.max_price
                ? formatPriceRange(property.min_price, property.max_price)
                : formatPrice(property.price)}
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
      </Link>
    </motion.div>
  );
}
