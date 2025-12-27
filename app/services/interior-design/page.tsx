"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Palette,
  Sofa,
  Lightbulb,
  Ruler,
  Phone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Sofa,
    title: "Living Spaces",
    description: "Modern living room designs that blend comfort with style",
  },
  {
    icon: Lightbulb,
    title: "Lighting Design",
    description: "Ambient lighting solutions to enhance your home's atmosphere",
  },
  {
    icon: Ruler,
    title: "Space Planning",
    description: "Optimize your space with smart layout and storage solutions",
  },
];

const designStyles = [
  "Contemporary",
  "Minimalist",
  "Traditional Indian",
  "Modern Luxury",
  "Scandinavian",
  "Industrial",
];

const processSteps = [
  {
    step: "01",
    title: "Consultation",
    description: "Free consultation to understand your vision and requirements",
  },
  {
    step: "02",
    title: "Design Concept",
    description: "Custom design concepts with 3D visualizations",
  },
  {
    step: "03",
    title: "Execution",
    description: "Professional execution with quality materials",
  },
  {
    step: "04",
    title: "Handover",
    description: "Final walkthrough and seamless handover",
  },
];

const features = [
  "Customized designs tailored to your taste",
  "End-to-end project management",
  "Quality materials and finishes",
  "Transparent pricing with no hidden costs",
  "On-time project delivery",
  "Post-completion support",
];

export default function InteriorDesignPage() {
  return (
    <main className="service-page">
      {/* Hero Section */}
      <section className="service-hero service-hero-interior">
        <div className="container">
          <motion.div
            className="service-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="service-hero-icon">
              <Palette className="w-12 h-12" />
            </div>
            <h1 className="service-hero-title">Interior Design Services</h1>
            <p className="service-hero-subtitle">
              Transform your new home into a personalized sanctuary. Our expert
              designers create stunning interiors that reflect your style and
              enhance your lifestyle.
            </p>
            <div className="service-hero-cta">
              <Link href="#contact" className="btn-primary">
                Get Free Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/properties" className="btn-secondary">
                Find Your Home First
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="service-benefits">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Our Expertise</span>
            <h2 className="section-title-new">What We Offer</h2>
          </motion.div>

          <motion.div
            className="service-benefits-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service) => (
              <motion.div
                key={service.title}
                className="service-benefit-card"
                variants={fadeInUp}
              >
                <div className="service-benefit-icon interior">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Design Styles */}
      <section className="service-styles">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Design Styles</span>
            <h2 className="section-title-new">Pick Your Style</h2>
            <p className="section-subtitle">
              From contemporary to traditional, we create designs that match
              your personality
            </p>
          </motion.div>

          <motion.div
            className="styles-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {designStyles.map((style) => (
              <div key={style} className="style-card">
                <Palette className="w-6 h-6" />
                <span>{style}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="service-process">
        <div className="container">
          <motion.div
            className="section-header section-header-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">How It Works</span>
            <h2 className="section-title-new">Our Process</h2>
          </motion.div>

          <motion.div
            className="process-steps"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {processSteps.map((item) => (
              <motion.div
                key={item.step}
                className="process-step-card"
                variants={fadeInUp}
              >
                <span className="process-step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features List */}
      <section className="service-features-list">
        <div className="container">
          <motion.div
            className="features-list-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Why Choose Our Interior Design Services?</h2>
            <div className="features-checklist">
              {features.map((feature) => (
                <div key={feature} className="feature-check-item">
                  <CheckCircle className="w-5 h-5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="service-contact">
        <div className="container">
          <motion.div
            className="service-contact-card interior"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="service-contact-content">
              <h2>Ready to Transform Your Space?</h2>
              <p>
                Get a free consultation with our interior design experts.
                Let&apos;s bring your vision to life.
              </p>
            </div>
            <div className="service-contact-cta">
              <a href="tel:+919876543210" className="btn-primary">
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi, I'm interested in interior design services"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
