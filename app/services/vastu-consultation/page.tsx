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
  Factory,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";

const services = [
  {
    icon: Home,
    title: "Homes",
    description:
      "Entrance, kitchen, bedrooms and puja room checked against their directions, with fixes for anything out of place.",
  },
  {
    icon: Building2,
    title: "Offices and shops",
    description:
      "Seating, cash counter and entrance placed to suit the way your business runs.",
  },
  {
    icon: Compass,
    title: "Plot selection",
    description:
      "Shape, facing, slope and surroundings checked before you buy, not after.",
  },
  {
    icon: Sparkles,
    title: "Remedies without demolition",
    description:
      "Corrections using colours, mirrors, plants and placement, so you don't have to break walls.",
  },
  {
    icon: Factory,
    title: "Factories and warehouses",
    description:
      "Layouts for machinery, storage and loading areas in industrial units.",
  },
  {
    icon: ClipboardCheck,
    title: "Vastu audit",
    description:
      "A full review of an existing property, with a written report and a prioritised list of fixes.",
  },
];

// The nine zones of the Vastu mandala, laid out with North at the top.
const zones = [
  { id: "NW", name: "North-west", element: "Air · ruled by Vayu", rooms: "Guest room, garage, storage for goods that move out", tip: "Good for anything that should keep moving." },
  { id: "N", name: "North", element: "Ruled by Kubera", rooms: "Living room, home office, safe or locker", tip: "Keep it light and uncluttered. Traditionally linked with money." },
  { id: "NE", name: "North-east", element: "Water · ruled by Ishana", rooms: "Puja room, meditation corner, water storage", tip: "The most sacred corner. Keep it open, clean and light." },
  { id: "W", name: "West", element: "Ruled by Varuna", rooms: "Children's room, dining room, study", tip: "A steady zone for study and family meals." },
  { id: "C", name: "Centre", element: "Space · Brahmasthan", rooms: "Leave it open", tip: "No pillars, heavy furniture or toilets at the centre of the home." },
  { id: "E", name: "East", element: "Ruled by Indra", rooms: "Main entrance, living room, windows", tip: "Let the morning sun in. A strong place for the entrance." },
  { id: "SW", name: "South-west", element: "Earth · ruled by Nirriti", rooms: "Master bedroom, heavy storage", tip: "The heaviest, most stable zone. Where the head of the family sleeps." },
  { id: "S", name: "South", element: "Ruled by Yama", rooms: "Bedrooms, wardrobes, heavy furniture", tip: "Keep it solid. Fewer openings here." },
  { id: "SE", name: "South-east", element: "Fire · ruled by Agni", rooms: "Kitchen, electrical panel, inverter", tip: "The fire corner. The ideal place for the stove." },
];

const processSteps = [
  {
    title: "Tell us about the property",
    description:
      "Share the address, floor plan if you have one, and anything that's bothering you.",
  },
  {
    title: "Site visit",
    description:
      "Our consultant visits to take directions and measurements, room by room.",
  },
  {
    title: "Written report",
    description:
      "You get a report with diagrams showing what's in the right zone and what isn't.",
  },
  {
    title: "Remedies",
    description:
      "Practical fixes, starting with the ones that need no structural change.",
  },
  {
    title: "Help putting them in place",
    description:
      "We guide you on placement, colours and other corrections as you make them.",
  },
  {
    title: "Follow-up review",
    description:
      "A check after the changes, with further suggestions if anything still needs work.",
  },
];

function ZoneMap() {
  const [active, setActive] = useState("NE");
  const zone = zones.find((z) => z.id === active)!;

  return (
    <div className="vsx-map">
      <div className="vsx-grid-wrap">
        <span className="vsx-north" aria-hidden="true">N ↑</span>
        <div className="vsx-grid" role="group" aria-label="Vastu zones of a home, North at the top">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              aria-pressed={z.id === active}
              onClick={() => setActive(z.id)}
              className={`vsx-cell${z.id === "C" ? " vsx-cell--centre" : ""}`}
            >
              <span className="vsx-cell-id">{z.id === "C" ? "•" : z.id}</span>
              <span className="vsx-cell-name">{z.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="vsx-detail" aria-live="polite">
        <span className="vsx-detail-element">{zone.element}</span>
        <h3>{zone.name}</h3>
        <dl>
          <div>
            <dt>Best for</dt>
            <dd>{zone.rooms}</dd>
          </div>
          <div>
            <dt>Keep in mind</dt>
            <dd>{zone.tip}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function VastuConsultationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="hlx-page">
        {/* Hero — landing page's dusk shell */}
        <section className="hero-v2">
          <div className="container hero-v2-container">
            <div className="hero-v2-content">
              <p className="hero-v2-eyebrow">Vastu consultation · Pune</p>
              <h1 className="hero-v2-heading">
                <span>Every room has</span>
                <em>a direction.</em>
              </h1>
              <p className="hero-v2-sub">
                Vastu Shastra reads a home the way a compass reads the earth.
                Entrance, kitchen, bedroom: each has a direction that suits
                it. Our consultants find what&apos;s out of place and fix it,
                without breaking walls where possible.
              </p>
              <div className="hero-v2-cta-group">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hero-v2-btn-primary"
                >
                  Book a consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a href="tel:+919673655631" className="hero-v2-btn-ghost">
                  <Phone className="w-5 h-5" />
                  Call us
                </a>
              </div>
              <p className="hero-v2-areas-label" id="vsx-modes-label">
                Consultations
              </p>
              <ul className="hero-v2-areas hlx-banks" aria-labelledby="vsx-modes-label">
                {["On-site", "Online", "Written report", "Follow-up"].map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            <figure className="hero-v2-tower idx-hero-art">
              <Image
                src="/vastuconsultation.png"
                alt=""
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="hero-v2-tower-img"
              />
            </figure>
          </div>
        </section>

        {/* Zone map — the signature */}
        <section className="hlx-section vsx-zones">
          <div className="container">
            <span className="featured-v2-eyebrow">The Vastu map</span>
            <h2 className="featured-v2-title">
              Nine zones, <em>one home.</em>
            </h2>
            <p className="hlx-body">
              Vastu divides a home into nine zones, each with its own ruling force.
              Tap a zone to see what belongs there.
            </p>
            <ZoneMap />
          </div>
        </section>

        {/* Services */}
        <section className="hlx-section">
          <div className="container hlx-split">
            <div className="hlx-split-head">
              <span className="featured-v2-eyebrow">What we cover</span>
              <h2 className="featured-v2-title">
                Homes, offices <em>and plots.</em>
              </h2>
              <p className="hlx-body">
                Practical advice for the property you live or work in, or the
                one you&apos;re about to buy. No superstition, just clear fixes.
              </p>
            </div>

            <motion.ul
              className="hlx-benefits"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {services.map((s) => (
                <motion.li key={s.title} variants={fadeInUp}>
                  <span className="hlx-benefit-icon">
                    <s.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* Process: a real sequence, so the steps are numbered */}
        <section className="hlx-section hlx-section--dusk">
          <div className="container">
            <span className="hero-v2-eyebrow">How it works</span>
            <h2 className="featured-v2-title hlx-title-light">
              From first call <em>to follow-up.</em>
            </h2>

            <motion.ol
              className="hlx-route hlx-route--six"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {processSteps.map((s, i) => (
                <motion.li key={s.title} variants={fadeInUp}>
                  <span className="hlx-route-dot">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* Closing CTA — landing page's saffron band */}
        <section id="contact" className="cta-v2">
          <div className="container cta-v2-inner">
            <h2 className="cta-v2-title">
              Not sure your home is aligned?
              <em>Let&apos;s check.</em>
            </h2>
            <div className="cta-v2-buttons">
              <button
                onClick={() => setIsModalOpen(true)}
                className="cta-v2-btn-primary"
              >
                Book a consultation
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="https://wa.me/919673655631?text=Hi, I'm interested in Vastu consultation services from Ghardaar24"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-v2-btn-outline"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp us
              </a>
            </div>
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
