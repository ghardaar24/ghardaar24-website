"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import { Building, Users, Award, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Building,
    value: "500+",
    label: "Properties Listed",
    color: "#3b82f6",
  },
  {
    icon: Users,
    value: "100%",
    label: "Client Satisfaction",
    color: "#10b981",
  },
  {
    icon: Award,
    value: "10+",
    label: "Years Experience",
    color: "#f59e0b",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Verified Properties",
    color: "#8b5cf6",
  },
];

export default function TrustIndicators() {
  return (
    <section className="trust-indicators-section">
      <div className="container">
        <motion.div
          className="trust-indicators-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="trust-indicator-card"
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="trust-indicator-icon"
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="trust-indicator-content">
                <span className="trust-indicator-value">{stat.value}</span>
                <span className="trust-indicator-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
