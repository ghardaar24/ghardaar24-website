"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Palette,
  Sofa,
  Lightbulb,
  Ruler,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Bed,
  UtensilsCrossed,
  Bath,
  Tv,
  Armchair,
  Home,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Sofa,
    title: "Living Room Design",
    description:
      "Create a stunning living space that's perfect for entertaining guests and relaxing with family. Modern sofas, accent pieces, and curated décor.",
  },
  {
    icon: Bed,
    title: "Bedroom Interiors",
    description:
      "Transform your bedroom into a luxurious retreat with custom wardrobes, elegant beds, ambient lighting, and calming color schemes.",
  },
  {
    icon: UtensilsCrossed,
    title: "Modular Kitchen",
    description:
      "Functional and stylish modular kitchens with smart storage, premium fittings, and designs that make cooking a joy.",
  },
  {
    icon: Bath,
    title: "Bathroom Design",
    description:
      "Spa-like bathrooms with quality tiles, modern fittings, vanities, and smart storage solutions.",
  },
  {
    icon: Tv,
    title: "Entertainment Units",
    description:
      "Custom TV units, home theaters, and entertainment centers designed for your viewing pleasure.",
  },
  {
    icon: Lightbulb,
    title: "Lighting Design",
    description:
      "Create the perfect ambiance with layered lighting - accent, task, and ambient lights for every room.",
  },
];

const designStyles = [
  {
    name: "Contemporary",
    description: "Clean lines, neutral colors, open spaces",
  },
  {
    name: "Minimalist",
    description: "Less is more - simple, functional, clutter-free",
  },
  {
    name: "Traditional Indian",
    description: "Rich colors, wooden elements, cultural motifs",
  },
  {
    name: "Modern Luxury",
    description: "Premium materials, statement pieces, sophisticated",
  },
  {
    name: "Scandinavian",
    description: "Light woods, whites, cozy textiles, functional",
  },
  {
    name: "Industrial",
    description: "Raw textures, exposed elements, urban chic",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Free Consultation",
    description:
      "Meet our designers to discuss your vision, preferences, budget, and timeline. We visit your space to understand it better.",
  },
  {
    step: "02",
    title: "Design Concept",
    description:
      "Receive detailed 3D renders and mood boards. Visualize your space before any work begins. Unlimited revisions until you're satisfied.",
  },
  {
    step: "03",
    title: "Material Selection",
    description:
      "Choose from curated premium materials, finishes, and products. We guide you through options that fit your budget.",
  },
  {
    step: "04",
    title: "Execution",
    description:
      "Our skilled craftsmen bring the design to life. Regular updates and quality checks at every stage.",
  },
  {
    step: "05",
    title: "Quality Assurance",
    description:
      "Rigorous quality checks before handover. We ensure every detail meets our high standards.",
  },
  {
    step: "06",
    title: "Handover & Support",
    description:
      "Final walkthrough and handover. 1-year warranty on all work with dedicated after-sales support.",
  },
];

const features = [
  "Customized designs tailored to your lifestyle",
  "End-to-end project management",
  "Premium quality materials and finishes",
  "Transparent pricing with no hidden costs",
  "On-time project delivery guaranteed",
  "1-year warranty on all work",
  "Dedicated project manager",
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="service-hero-icon interior">
              <Palette className="w-12 h-12" />
            </div>
            <h1 className="service-hero-title">Interior Design Services</h1>
            <p className="service-hero-subtitle">
              Your home is a reflection of who you are. Our expert designers
              create stunning, personalized interiors that combine aesthetics
              with functionality. From concept to completion, we handle
              everything while you sit back and watch your dream home come to
              life.
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
            <h2 className="section-title-new">
              Complete Home Interior Solutions
            </h2>
            <p className="section-subtitle">
              From living rooms to bathrooms, we design every corner of your
              home with equal care and attention
            </p>
          </motion.div>

          <motion.div
            className="service-benefits-grid extended"
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
              Whether you prefer contemporary minimalism or traditional warmth,
              we create designs that reflect your personality
            </p>
          </motion.div>

          <motion.div
            className="styles-grid extended"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {designStyles.map((style) => (
              <div key={style.name} className="style-card extended">
                <Sparkles className="w-6 h-6" />
                <span className="style-name">{style.name}</span>
                <span className="style-desc">{style.description}</span>
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
            <span className="section-label">Our Process</span>
            <h2 className="section-title-new">How We Work</h2>
            <p className="section-subtitle">
              A transparent, step-by-step approach to bring your vision to life
            </p>
          </motion.div>

          <motion.div
            className="process-steps extended"
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
            <h2>Why Choose Ghardaar24 Interior Design?</h2>
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
                We&apos;ll visit your home, understand your requirements, and
                provide a detailed quote - all at no cost. Let&apos;s bring your
                vision to life.
              </p>
            </div>
            <div className="service-contact-cta">
              <a href="tel:+919876543210" className="btn-primary">
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi, I'm interested in interior design services from Ghardaar24"
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
