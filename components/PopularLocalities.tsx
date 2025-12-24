"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

const localities = [
  {
    name: "Warje",
    city: "Pune",
    propertyCount: 45,
    image: "/localities/warje.jpg",
  },
  {
    name: "Kothrud",
    city: "Pune",
    propertyCount: 52,
    image: "/localities/kothrud.jpg",
  },
  {
    name: "Viman Nagar",
    city: "Pune",
    propertyCount: 38,
    image: "/localities/viman-nagar.jpg",
  },
  {
    name: "Balewadi",
    city: "Pune",
    propertyCount: 41,
    image: "/localities/balewadi.jpg",
  },
  {
    name: "Malunje",
    city: "Pune",
    propertyCount: 29,
    image: "/localities/malunje.jpg",
  },
  {
    name: "Bibwewadi",
    city: "Pune",
    propertyCount: 35,
    image: "/localities/bibwewadi.jpg",
  },
  {
    name: "Market Yard",
    city: "Pune",
    propertyCount: 24,
    image: "/localities/market-yard.jpg",
  },
];

export default function PopularLocalities() {
  return (
    <section className="localities-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="section-title-new">Popular Localities</h2>
            <p className="section-subtitle">
              Explore properties in the most sought-after neighborhoods
            </p>
          </div>
          <Link href="/properties" className="btn-outline-new">
            View all areas <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          className="localities-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {localities.map((locality) => (
            <motion.div
              key={locality.name}
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/properties?city=${locality.city}&locality=${locality.name}`}
                className="locality-card"
              >
                <div className="locality-card-bg" />
                <div className="locality-card-content">
                  <div className="locality-icon">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="locality-name">{locality.name}</h3>
                  <p className="locality-city">{locality.city}</p>

                </div>
                <div className="locality-arrow">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
