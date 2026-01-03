"use client";

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
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
  const mainImage = property.images?.[0] || "/placeholder-property.jpg";

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
      style={{ height: "100%" }}
    >
      <Link
        href={`/properties/${property.id}`}
        className="property-card-new group"
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
            {property.bedrooms > 0 && (
              <div className="feature-item-new">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="feature-item-new">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.carpet_area && (
              <div className="feature-item-new">
                <Maximize className="w-4 h-4" />
                <span>{property.carpet_area}</span>
              </div>
            )}
          </div>

          <div className="property-card-footer">
            <span className="property-card-price">
              {property.min_price || property.max_price
                ? formatPriceRange(property.min_price, property.max_price)
                : formatPrice(property.price)}
              {property.listing_type === "rent" && (
                <span className="price-period">/mo</span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
