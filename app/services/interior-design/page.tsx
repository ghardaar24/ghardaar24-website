"use client";

import { useState } from "react";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Sofa,
  Lightbulb,
  Phone,
  ArrowRight,
  Bed,
  UtensilsCrossed,
  Bath,
  Tv,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";

const services = [
  {
    icon: Sofa,
    title: "Living rooms",
    description:
      "Seating, storage and décor planned around how your family actually uses the room, and how many guests you host.",
  },
  {
    icon: Bed,
    title: "Bedrooms",
    description:
      "Custom wardrobes, beds and soft lighting, in colours that help you wind down at night.",
  },
  {
    icon: UtensilsCrossed,
    title: "Modular kitchens",
    description:
      "Smart storage, durable fittings and a layout that keeps everything you cook with within reach.",
  },
  {
    icon: Bath,
    title: "Bathrooms",
    description:
      "Quality tiles, modern fittings, vanities and storage that stand up to daily use.",
  },
  {
    icon: Tv,
    title: "TV and entertainment units",
    description:
      "Custom TV walls, media units and home-theatre setups with the wiring hidden away.",
  },
  {
    icon: Lightbulb,
    title: "Lighting",
    description:
      "Layered ambient, task and accent lighting, so every room works by day and by night.",
  },
];

// Each style repaints the same room: wall, floor, sofa, accent, rug, wood.
const designStyles = [
  {
    name: "Contemporary",
    description: "Clean lines, neutral colours, open spaces",
    room: { wall: "#e9e3d8", floor: "#b9a68a", sofa: "#8c8170", accent: "#2f3b40", rug: "#d8cfc0", wood: "#5c4a3a" },
  },
  {
    name: "Minimalist",
    description: "Simple, functional and clutter-free",
    room: { wall: "#f5f2ec", floor: "#ddd3c3", sofa: "#e2dacd", accent: "#b8ab97", rug: "#ece6db", wood: "#c7b79d" },
  },
  {
    name: "Traditional Indian",
    description: "Rich colours, carved wood, cultural motifs",
    room: { wall: "#e8c9a0", floor: "#7a4a2a", sofa: "#9a3b22", accent: "#d98a3d", rug: "#5e2a17", wood: "#4a2814" },
  },
  {
    name: "Modern luxury",
    description: "Premium materials and statement pieces",
    room: { wall: "#3b2f38", floor: "#2a2420", sofa: "#5b4a57", accent: "#c9a46a", rug: "#6e5a68", wood: "#c9a46a" },
  },
  {
    name: "Scandinavian",
    description: "Light woods, whites and cosy textiles",
    room: { wall: "#f2ede3", floor: "#d9c4a0", sofa: "#b8c0c2", accent: "#e4b363", rug: "#fbf9f5", wood: "#c9ab7c" },
  },
  {
    name: "Industrial",
    description: "Raw textures, exposed brick and metal",
    room: { wall: "#8a5a44", floor: "#6b6459", sofa: "#3a3632", accent: "#c46a2f", rug: "#a8a39b", wood: "#2b2826" },
  },
];

type Room = (typeof designStyles)[number]["room"];

// One living room drawn once; every fill reads from the active style's palette.
function RoomPreview({ room }: { room: Room }) {
  return (
    <svg viewBox="0 0 480 340" className="idx-room-svg" aria-hidden="true">
      <rect width="480" height="244" fill={room.wall} />
      <rect y="244" width="480" height="96" fill={room.floor} />
      <rect y="238" width="480" height="6" fill={room.wood} />

      {/* wall art */}
      <rect x="92" y="46" width="96" height="74" rx="4" fill={room.wood} />
      <rect x="98" y="52" width="84" height="62" rx="2" fill={room.accent} />
      <rect x="202" y="62" width="54" height="58" rx="4" fill={room.wood} />
      <rect x="208" y="68" width="42" height="46" rx="2" fill={room.rug} />

      {/* floor lamp */}
      <rect x="402" y="118" width="4" height="128" fill={room.wood} />
      <ellipse cx="404" cy="248" rx="18" ry="4" fill={room.wood} />
      <path d="M380 120 L428 120 L418 86 L390 86 Z" fill={room.accent} />
      <ellipse cx="404" cy="126" rx="34" ry="8" fill="#f6b26b" opacity="0.25" />

      {/* plant */}
      <ellipse cx="52" cy="184" rx="14" ry="30" fill="#5f7a45" transform="rotate(-18 52 184)" />
      <ellipse cx="72" cy="178" rx="13" ry="34" fill="#6f8b52" transform="rotate(14 72 178)" />
      <ellipse cx="62" cy="196" rx="12" ry="26" fill="#56703e" />
      <path d="M44 214 L80 214 L76 250 L48 250 Z" fill={room.wood} />

      {/* rug + coffee table */}
      <ellipse cx="240" cy="296" rx="176" ry="28" fill={room.rug} />
      <rect x="194" y="268" width="96" height="9" rx="4" fill={room.wood} />
      <rect x="202" y="277" width="5" height="20" fill={room.wood} />
      <rect x="277" y="277" width="5" height="20" fill={room.wood} />

      {/* sofa */}
      <rect x="118" y="158" width="244" height="64" rx="16" fill={room.sofa} />
      <rect x="108" y="204" width="264" height="40" rx="12" fill={room.sofa} />
      <rect x="108" y="204" width="264" height="40" rx="12" fill="#000" opacity="0.08" />
      <rect x="96" y="182" width="32" height="64" rx="14" fill={room.sofa} />
      <rect x="352" y="182" width="32" height="64" rx="14" fill={room.sofa} />
      <rect x="96" y="182" width="32" height="64" rx="14" fill="#000" opacity="0.06" />
      <rect x="352" y="182" width="32" height="64" rx="14" fill="#000" opacity="0.06" />
      <rect x="140" y="174" width="50" height="38" rx="10" fill={room.accent} transform="rotate(-6 165 193)" />
      <rect x="290" y="174" width="50" height="38" rx="10" fill={room.rug} transform="rotate(6 315 193)" />
      <rect x="116" y="244" width="6" height="10" fill={room.wood} />
      <rect x="358" y="244" width="6" height="10" fill={room.wood} />
    </svg>
  );
}

function StylePicker() {
  const [active, setActive] = useState(0);
  const style = designStyles[active];

  return (
    <div className="idx-picker">
      <div className="idx-picker-list" role="group" aria-label="Design styles">
        {designStyles.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className="idx-picker-btn"
          >
            <span
              className="idx-picker-dot"
              style={{ background: `linear-gradient(135deg, ${s.room.wall} 50%, ${s.room.sofa} 50%)` }}
              aria-hidden="true"
            />
            {s.name}
          </button>
        ))}
      </div>

      <figure className="idx-room">
        <RoomPreview room={style.room} />
        <figcaption className="idx-room-caption">
          <span>
            <strong>{style.name}</strong> {style.description}
          </span>
          <span className="idx-room-swatches" aria-hidden="true">
            {Object.values(style.room).map((c, i) => (
              <span key={i} style={{ background: c }} />
            ))}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

const processSteps = [
  {
    title: "Free consultation",
    description:
      "We visit your home and talk through your taste, budget and timeline.",
  },
  {
    title: "Design concept",
    description:
      "You get 3D renders and mood boards, with revisions until you're happy.",
  },
  {
    title: "Material selection",
    description:
      "Pick finishes and products from a curated range that fits your budget.",
  },
  {
    title: "Execution",
    description:
      "Our craftsmen build the design, with regular updates and checks at every stage.",
  },
  {
    title: "Quality check",
    description:
      "We inspect every detail before handover and fix anything that's off.",
  },
  {
    title: "Handover",
    description:
      "A final walkthrough with you, backed by a 1-year warranty on all work.",
  },
];

const stats = [
  { value: "₹0", label: "Consultation and site visit" },
  { value: "3D", label: "Renders before work starts" },
  { value: "1", label: "Project manager, start to finish" },
  { value: "1 yr", label: "Warranty on all work" },
];

export default function InteriorDesignPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="hlx-page">
        {/* Hero — landing page's dusk shell */}
        <section className="hero-v2">
          <div className="container hero-v2-container">
            <div className="hero-v2-content">
              <p className="hero-v2-eyebrow">Interior design · Pune</p>
              <h1 className="hero-v2-heading">
                <span>A home that</span>
                <em>finally looks like you.</em>
              </h1>
              <p className="hero-v2-sub">
                Our designers pair your taste with a plan we can actually
                build: mood boards, material lists, and a crew that shows up.
                From first sketch to final walkthrough.
              </p>
              <div className="hero-v2-cta-group">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hero-v2-btn-primary"
                >
                  Get a free quote
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a href="tel:+919673655631" className="hero-v2-btn-ghost">
                  <Phone className="w-5 h-5" />
                  Call us
                </a>
              </div>
              <p className="hero-v2-areas-label" id="idx-rooms-label">
                Rooms we design
              </p>
              <ul className="hero-v2-areas hlx-banks" aria-labelledby="idx-rooms-label">
                {["Living", "Bedroom", "Kitchen", "Bathroom", "Full home"].map(
                  (room) => (
                    <li key={room}>{room}</li>
                  )
                )}
              </ul>
            </div>

            <figure className="hero-v2-tower idx-hero-art">
              <Image
                src="/interiordesign.png"
                alt=""
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="hero-v2-tower-img"
              />
              <figcaption className="hero-v2-tower-tag">
                <strong>3D</strong> renders before we build
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Trust strip */}
        <section className="trust-v2">
          <div className="container">
            <dl className="trust-v2-list">
              {stats.map((stat) => (
                <div key={stat.label} className="trust-v2-item">
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Style picker — the signature: one room, six ways */}
        <section className="hlx-section idx-styles">
          <div className="container">
            <span className="featured-v2-eyebrow">Start with a style</span>
            <h2 className="featured-v2-title">
              Same room, <em>six ways.</em>
            </h2>
            <p className="hlx-body">
              Pick a style to see how it changes a living room. Tell us which
              one feels like home and we&apos;ll build your mood board from it.
            </p>
            <StylePicker />
          </div>
        </section>

        {/* Services */}
        <section className="hlx-section">
          <div className="container hlx-split">
            <div className="hlx-split-head">
              <span className="featured-v2-eyebrow">What we design</span>
              <h2 className="featured-v2-title">
                One room <em>or the whole home.</em>
              </h2>
              <p className="hlx-body">
                Every room gets the same care, whether it&apos;s a kitchen
                refresh or a full move-in fit-out.
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
              From first sketch <em>to handover.</em>
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
              Got the keys?
              <em>Let&apos;s make it yours.</em>
            </h2>
            <div className="cta-v2-buttons">
              <button
                onClick={() => setIsModalOpen(true)}
                className="cta-v2-btn-primary"
              >
                Get a free quote
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link href="/properties" className="cta-v2-btn-outline">
                Find your home first
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <ConsultationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="interior_design"
      />
    </>
  );
}
