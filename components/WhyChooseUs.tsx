"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  ShieldCheck,
  BadgePercent,
  Palette,
  Landmark,
  Compass,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Properties",
    description:
      "Every property is personally verified by our team for authenticity",
    color: "#3b82f6",
  },
  {
    icon: BadgePercent,
    title: "Zero Brokerage",
    description:
      "No hidden charges. Pay only what you see - 100% transparent pricing",
    color: "#10b981",
  },
  {
    icon: Palette,
    title: "Interior Design",
    description:
      "Transform your new home with our professional interior design services",
    color: "#8b5cf6",
  },
  {
    icon: Landmark,
    title: "Home Loan Assistance",
    description: "Get the best home loan rates with our banking partners",
    color: "#f59e0b",
  },
  {
    icon: Compass,
    title: "Vastu Consultation",
    description: "Expert Vastu guidance for harmonious and prosperous living spaces",
    color: "#ec4899",
  },
  {
    icon: Clock,
    title: "Quick Possession",
    description: "Fast documentation and hassle-free property handover",
    color: "#06b6d4",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-choose-section">
      <div className="container">
        <motion.div
          className="section-header section-header-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Why Ghardaar24?</span>
          <h2 className="section-title-new">Why Choose Us</h2>
          <p className="section-subtitle">
            We make property buying and renting simple, transparent, and
            stress-free
          </p>
        </motion.div>

        <motion.div
          className="why-choose-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="why-choose-card"
              variants={fadeInUp}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="why-choose-icon"
                style={{
                  backgroundColor: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="why-choose-title">{feature.title}</h3>
              <p className="why-choose-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
