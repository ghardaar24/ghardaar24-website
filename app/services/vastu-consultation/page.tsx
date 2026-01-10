
"use client";

import { useState } from "react";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Compass,
  Home,
  Building2,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle,
  Sun,
  Wind,
  Droplets,
  Flame,
  Mountain,
  Star,
  Shield,
  TrendingUp,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";

const services = [
  {
    icon: Home,
    title: "Residential Vastu",
    description:
      "Complete Vastu analysis for your home including room placements, entrance direction, kitchen positioning, and bedroom layouts for positive energy flow.",
  },
  {
    icon: Building2,
    title: "Commercial Vastu",
    description:
      "Optimize your office, shop, or business premises with Vastu principles to enhance productivity, attract prosperity, and create a harmonious work environment.",
  },
  {
    icon: Compass,
    title: "Plot Selection",
    description:
      "Guidance on selecting the right plot based on Vastu principles including shape, direction, slope, and surrounding environment analysis.",
  },
  {
    icon: Sparkles,
    title: "Vastu Remedies",
    description:
      "Practical, non-demolition remedies to correct Vastu defects in existing properties using colors, mirrors, plants, and energy balancing techniques.",
  },
  {
    icon: TrendingUp,
    title: "Industrial Vastu",
    description:
      "Specialized Vastu consultation for factories, warehouses, and industrial units to improve efficiency, reduce accidents, and boost growth.",
  },
  {
    icon: Shield,
    title: "Vastu Audit",
    description:
      "Comprehensive evaluation of your existing property with detailed report, identifying issues and providing actionable recommendations.",
  },
];

const elements = [
  {
    icon: Mountain,
    name: "Earth (Prithvi)",
    direction: "South-West",
    color: "bg-amber-100 text-amber-700",
    description: "Stability, strength, and grounding energy",
  },
  {
    icon: Droplets,
    name: "Water (Jal)",
    direction: "North-East",
    color: "bg-blue-100 text-blue-700",
    description: "Purity, clarity, and spiritual growth",
  },
  {
    icon: Flame,
    name: "Fire (Agni)",
    direction: "South-East",
    color: "bg-red-100 text-red-700",
    description: "Energy, transformation, and success",
  },
  {
    icon: Wind,
    name: "Air (Vayu)",
    direction: "North-West",
    color: "bg-teal-100 text-teal-700",
    description: "Movement, freshness, and opportunities",
  },
  {
    icon: Sun,
    name: "Space (Akash)",
    direction: "Center",
    color: "bg-purple-100 text-purple-700",
    description: "Expansion, consciousness, and balance",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Well-being",
    description: "Promote physical and mental health through balanced energy in living spaces",
  },
  {
    icon: TrendingUp,
    title: "Financial Prosperity",
    description: "Attract wealth and abundance by optimizing the flow of positive energy",
  },
  {
    icon: Star,
    title: "Harmonious Relationships",
    description: "Create an environment that fosters love, understanding, and peace in family",
  },
  {
    icon: Shield,
    title: "Protection & Security",
    description: "Shield your home from negative energies and create a safe sanctuary",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Initial Consultation",
    description:
      "Share your property details and concerns. We understand your requirements, goals, and any specific issues you're facing.",
  },
  {
    step: "02",
    title: "Site Analysis",
    description:
      "Our Vastu expert visits your property to analyze directions, measurements, placements, and energy patterns using traditional and modern techniques.",
  },
  {
    step: "03",
    title: "Detailed Report",
    description:
      "Receive a comprehensive Vastu analysis report with findings, significance of each observation, and their impact on different life aspects.",
  },
  {
    step: "04",
    title: "Remedial Solutions",
    description:
      "Get practical, implementable remedies - both with and without structural changes. We prioritize non-demolition solutions.",
  },
  {
    step: "05",
    title: "Implementation Support",
    description:
      "Guidance during implementation of remedies. We assist with placement of items, colors, and other Vastu corrections.",
  },
  {
    step: "06",
    title: "Follow-up Review",
    description:
      "Post-implementation review to assess changes and provide any additional recommendations if needed.",
  },
];

const features = [
  "Certified Vastu consultants with 15+ years experience",
  "Scientific approach combined with traditional wisdom",
  "No superstition - only practical solutions",
  "Detailed written reports with diagrams",
  "Both on-site and online consultations available",
  "Affordable pricing with no hidden charges",
  "Post-consultation support included",
  "Privacy and confidentiality guaranteed",
];

export default function VastuConsultationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="service-page">
        {/* Hero Section */}
        <section className="service-hero">
          <div className="container">
            <motion.div
              className="service-hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="service-hero-icon">
                <Compass className="w-12 h-12" />
              </div>
              <h1 className="service-hero-title">Vastu Consultation Services</h1>
              <p className="service-hero-subtitle">
                Harmonize your living and working spaces with ancient Vastu Shastra
                principles. Our expert consultants help you create environments that
                promote health, wealth, and happiness through proper alignment with
                natural energies and cosmic forces.
              </p>
              <div className="service-hero-cta">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary"
                >
                  Book Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/properties" className="btn-secondary">
                  Browse Vastu-Compliant Homes
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Five Elements Section */}
        <section className="service-elements">
          <div className="container">
            <motion.div
              className="section-header section-header-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">The Foundation</span>
              <h2 className="section-title-new">
                The Five Elements of Vastu
              </h2>
              <p className="section-subtitle">
                Vastu Shastra is based on balancing the five natural elements
                (Pancha Bhoota) to create harmony in your space
              </p>
            </motion.div>

            <motion.div
              className="elements-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {elements.map((element) => (
                <div key={element.name} className={`element-card ${element.color}`}>
                  <element.icon className="w-8 h-8" />
                  <span className="element-name">{element.name}</span>
                  <span className="element-direction">{element.direction}</span>
                  <span className="element-desc">{element.description}</span>
                </div>
              ))}
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
              <span className="section-label">Our Services</span>
              <h2 className="section-title-new">
                Comprehensive Vastu Solutions
              </h2>
              <p className="section-subtitle">
                From residential homes to commercial spaces, we provide expert
                Vastu guidance for all property types
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
                  <div className="service-benefit-icon">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="service-styles">
          <div className="container">
            <motion.div
              className="section-header section-header-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">Benefits</span>
              <h2 className="section-title-new">Why Vastu Matters</h2>
              <p className="section-subtitle">
                A Vastu-compliant space can positively impact various aspects of your life
              </p>
            </motion.div>

            <motion.div
              className="benefits-showcase"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.title}
                  className="benefit-showcase-card"
                  variants={fadeInUp}
                >
                  <div className="benefit-showcase-icon">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </motion.div>
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
                A systematic approach to analyze and optimize your space
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
              <h2>Why Choose Ghardaar24 Vastu Services?</h2>
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
              className="service-contact-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="service-contact-content">
                <h2>Ready for a Vastu Consultation?</h2>
                <p>
                  Take the first step towards a harmonious living space. Our
                  certified Vastu experts are ready to help you unlock the
                  potential of your property. Schedule a consultation today and
                  experience the positive transformation.
                </p>
              </div>
              <div className="service-contact-cta">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary"
                >
                  Book Consultation
                </button>
                <a href="tel:+919673655631" className="btn-secondary">
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
                <a
                  href="https://wa.me/919673655631?text=Hi, I'm interested in Vastu consultation services from Ghardaar24"
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
      <Footer />
      <ConsultationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="vastu_consultation"
      />
    </>
  );
}
