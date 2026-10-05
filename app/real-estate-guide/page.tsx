import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, AlertTriangle, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Real Estate Guide India | Property Buying Basics | Ghardaar24",
  description:
    "Complete guide to understanding real estate in India. Learn about property types, RERA, legal documents, home loans, stamp duty, registration, and more.",
  keywords: [
    "real estate guide India",
    "property buying guide",
    "RERA India",
    "home loan India",
    "stamp duty",
    "property registration",
    "real estate basics",
    "property investment India",
    "Freehold vs Leasehold",
    "carpet area vs built-up area",
  ],
  openGraph: {
    title: "Real Estate Guide India | Ghardaar24",
    description:
      "Complete guide to understanding real estate basics and property buying in India.",
    type: "website",
    url: "https://ghardaar24.com/real-estate-guide",
  },
  alternates: {
    canonical: "https://ghardaar24.com/real-estate-guide",
  },
};

// Content blocks a chapter can contain; rendered by <Block> below.
type Block =
  | { kind: "terms"; title: string; items: [string, string][] }
  | { kind: "list"; title: string; items: string[]; style?: "check" | "steps" }
  | { kind: "compare"; title: string; items: [string, string][] }
  | { kind: "warning"; title: string; items: string[] }
  | { kind: "tip"; text: string }
  | { kind: "stat"; value: string; text: string; note: string }
  | { kind: "text"; title: string; text: string };

const chapters: { id: string; title: string; summary: string; blocks: Block[] }[] = [
  {
    id: "property-types",
    title: "Types of property",
    summary: "What you can buy, who owns the land, and how area is measured.",
    blocks: [
      {
        kind: "terms",
        title: "Residential",
        items: [
          ["Apartment or flat", "A unit in a multi-storey building. The most common choice in cities."],
          ["Independent house", "A standalone home on its own land, with more privacy and space."],
          ["Villa", "A premium independent home, often in a gated community with amenities."],
          ["Row house", "Homes that share side walls with neighbours but have their own entrances."],
          ["Plot", "Vacant land you can build on to your own plan."],
        ],
      },
      {
        kind: "terms",
        title: "Commercial",
        items: [
          ["Office space", "Workspace in a commercial complex."],
          ["Retail shop", "Usually a ground-floor unit for a store or business."],
          ["Warehouse", "Large storage space for goods and inventory."],
          ["Industrial land", "Land in zones set aside for manufacturing."],
        ],
      },
      {
        kind: "compare",
        title: "Freehold or leasehold?",
        items: [
          ["Freehold", "You own the building and the land, with no time limit. You can sell, transfer or pass it on freely."],
          ["Leasehold", "You own the building but lease the land, usually for 99 years, from the government or an authority."],
        ],
      },
      {
        kind: "terms",
        title: "How area is measured",
        items: [
          ["Carpet area", "The usable floor area inside the walls. What you actually live in."],
          ["Built-up area", "Carpet area plus walls and balcony. Usually 10–15% more than carpet."],
          ["Super built-up area", "Built-up area plus a share of lobbies, stairs and other common areas. Often 25–30% more than carpet."],
        ],
      },
      { kind: "tip", text: "Always compare properties by carpet area. RERA requires builders to price by carpet area." },
    ],
  },
  {
    id: "rera",
    title: "Understanding RERA",
    summary: "The law that protects buyers, and how to check a project is registered.",
    blocks: [
      {
        kind: "text",
        title: "What is RERA?",
        text: "The Real Estate (Regulation and Development) Act, 2016 protects home buyers and makes deals more transparent. Every real estate project and agent must register with the state's regulatory authority before selling.",
      },
      {
        kind: "list",
        title: "What it gives you",
        style: "check",
        items: [
          "Projects must be registered before they're sold",
          "70% of buyers' money is kept in a separate escrow account",
          "One standard definition of carpet area",
          "Penalties for builders who deliver late",
          "5 years of defect liability after possession",
          "A single place to file complaints",
          "No changes to the plan without buyers' consent",
        ],
      },
      {
        kind: "list",
        title: "How to check a registration",
        style: "steps",
        items: [
          "Open your state's RERA website (MahaRERA in Maharashtra)",
          "Search by project name, promoter name or RERA number",
          "Check the project's status, completion date and approvals",
          "Check the agent's registration, if you're using one",
          "Read the quarterly progress reports",
        ],
      },
      { kind: "tip", text: "Check the RERA number printed on every advert and agreement against the official website." },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    summary: "What to verify before you pay, and what you need to register.",
    blocks: [
      {
        kind: "terms",
        title: "Check these before you buy",
        items: [
          ["Title deed", "Proves the seller owns the property."],
          ["Encumbrance certificate (EC)", "Shows the property has no unpaid loans or legal dues against it."],
          ["Approved building plan", "The layout sanctioned by the municipal authority."],
          ["Commencement certificate", "Permission to start construction."],
          ["Occupancy certificate (OC)", "Confirms the building is fit to live in, as per the approved plan."],
          ["Completion certificate (CC)", "Confirms construction was finished as per the approved plan."],
          ["NOCs", "No-objection certificates from the fire, water and electricity departments."],
        ],
      },
      {
        kind: "list",
        title: "Bring these to registration",
        style: "check",
        items: [
          "Sale deed",
          "Property tax receipts",
          "Identity and address proof of buyer and seller",
          "PAN cards of both parties",
          "Passport-size photographs",
          "Power of attorney, if someone is signing on another's behalf",
          "Society NOC, for resale properties",
        ],
      },
      {
        kind: "warning",
        title: "Walk away if you see",
        items: [
          "Unclear title or disputed ownership",
          "Missing or expired approvals",
          "A builder not registered with RERA",
          "Pending court cases that weren't disclosed",
          "A sale agreement that isn't registered",
          "Pressure to pay in cash without receipts",
          "Construction that doesn't match the approved plan",
        ],
      },
    ],
  },
  {
    id: "home-loans",
    title: "Home loans",
    summary: "Loan types, who qualifies, the terms on your sanction letter, and tax savings.",
    blocks: [
      {
        kind: "terms",
        title: "Types of home loan",
        items: [
          ["Purchase loan", "To buy a ready or under-construction property."],
          ["Construction loan", "To build a house on land you already own."],
          ["Extension loan", "To add space to your existing home."],
          ["Renovation loan", "For repairs and improvements."],
          ["Plot loan", "To buy land. Banks usually lend a smaller share of the value."],
          ["Balance transfer", "To move your loan to another bank for a better rate."],
        ],
      },
      {
        kind: "list",
        title: "What banks look at",
        style: "check",
        items: [
          "Age, usually 21–65",
          "Income and how stable your job is",
          "Credit score (750 or above is ideal)",
          "EMIs you're already paying",
          "The property's value and location",
          "Whether you're salaried or self-employed",
        ],
      },
      { kind: "tip", text: "Banks usually approve an EMI of up to 45–50% of your take-home pay." },
      {
        kind: "terms",
        title: "Terms to know",
        items: [
          ["LTV ratio", "Loan-to-value. Banks lend 75–90% of the property's value, depending on the loan size."],
          ["EMI", "Equated monthly instalment: the fixed amount you repay each month."],
          ["Fixed or floating", "A fixed rate stays the same; a floating rate moves with the market."],
          ["Processing fee", "Usually 0.25–1% of the loan amount."],
          ["Prepayment", "Paying extra to cut your tenure or your EMI."],
        ],
      },
      {
        kind: "terms",
        title: "Tax benefits (old tax regime)",
        items: [
          ["Section 80C", "Deduct up to ₹1.5 lakh a year of principal repaid."],
          ["Section 24(b)", "Deduct up to ₹2 lakh a year of interest on a self-occupied home."],
          ["Section 80EEA", "An extra ₹1.5 lakh for first-time buyers, but only on loans sanctioned up to 31 March 2022."],
        ],
      },
      { kind: "tip", text: "With a joint home loan, each co-borrower who is also a co-owner can claim these deductions separately." },
    ],
  },
  {
    id: "costs",
    title: "Costs beyond the price",
    summary: "Stamp duty, builder charges and running costs to budget for.",
    blocks: [
      {
        kind: "stat",
        value: "10–15%",
        text: "of the property price: keep this aside for costs on top of the base price.",
        note: "On a ₹50 lakh home, that's ₹5–7.5 lakh for stamp duty, registration, GST, society charges and moving.",
      },
      {
        kind: "text",
        title: "Stamp duty and registration",
        text: "Stamp duty depends on the state and city, and women buyers often get a lower rate. In Maharashtra, stamp duty is roughly 5–7% depending on the area, women get a 1% concession, and registration is 1% capped at ₹30,000. Check the current rate for your area on the IGR Maharashtra website.",
      },
      {
        kind: "terms",
        title: "Builder and society charges",
        items: [
          ["GST", "5% on under-construction homes, 1% on affordable housing. None once the OC is issued."],
          ["Preferred location charge", "Extra for corner, garden-facing or higher-floor units."],
          ["Parking", "Often ₹2–10 lakh for a covered spot."],
          ["Club and amenities", "A one-time fee for access to facilities."],
          ["Maintenance deposit", "Usually 12–24 months paid in advance."],
        ],
      },
      {
        kind: "terms",
        title: "Running costs",
        items: [
          ["Property tax", "Paid every year to the municipal corporation."],
          ["Maintenance", "Monthly society charges, often ₹2–15 per sq ft."],
          ["Home insurance", "An annual premium; worth having."],
          ["Utilities", "Electricity, water, gas and internet."],
        ],
      },
    ],
  },
  {
    id: "legal",
    title: "Legal checks",
    summary: "Due diligence, key legal papers, and when to call a professional.",
    blocks: [
      {
        kind: "list",
        title: "Due diligence checklist",
        style: "check",
        items: [
          "Verify the seller's identity and ownership",
          "Confirm the title is clear and marketable",
          "Trace at least 30 years of ownership history",
          "Check every approval and NOC",
          "Check for unpaid loans or charges on the property",
          "Confirm there are no court cases",
          "Make sure property tax is paid up to date",
          "Check the building matches the approved plan",
        ],
      },
      {
        kind: "terms",
        title: "Key legal documents",
        items: [
          ["Sale deed", "The final transfer document, registered at the sub-registrar's office."],
          ["Agreement for sale", "The preliminary contract setting out the terms."],
          ["Power of attorney", "Lets one person act for the owner."],
          ["Mother deed", "The original deed that traces the property's ownership."],
          ["Property card or 7/12 extract", "Maharashtra's land records showing the owner. Other states use similar records, such as the Khata in Karnataka."],
        ],
      },
      {
        kind: "compare",
        title: "When to call a professional",
        items: [
          ["Property lawyer", "Title checks, document review and legal due diligence. Essential for high-value or complicated deals."],
          ["Chartered accountant", "Tax planning, capital gains and getting the most from home loan deductions."],
          ["Property valuer", "A fair market value, especially for resale homes or a loan."],
        ],
      },
    ],
  },
];

function Block({ block }: { block: Block }) {
  switch (block.kind) {
    case "terms":
      return (
        <div className="rsx-block">
          <h3>{block.title}</h3>
          <dl className="rsx-terms">
            {block.items.map(([t, d]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "list": {
      const Tag = block.style === "steps" ? "ol" : "ul";
      return (
        <div className="rsx-block">
          <h3>{block.title}</h3>
          <Tag className={`rsx-list rsx-list--${block.style ?? "check"}`}>
            {block.items.map((item, i) => (
              <li key={item}>
                <span className="rsx-list-mark" aria-hidden="true">
                  {block.style === "steps" ? i + 1 : <Check className="w-3.5 h-3.5" />}
                </span>
                {item}
              </li>
            ))}
          </Tag>
        </div>
      );
    }
    case "compare":
      return (
        <div className="rsx-block">
          <h3>{block.title}</h3>
          <div className="rsx-compare">
            {block.items.map(([h, p]) => (
              <div key={h}>
                <h4>{h}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "warning":
      return (
        <div className="rsx-block rsx-warning">
          <h3>
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            {block.title}
          </h3>
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case "tip":
      return (
        <p className="rsx-tip">
          <Lightbulb className="w-5 h-5" aria-hidden="true" />
          <span>{block.text}</span>
        </p>
      );
    case "stat":
      return (
        <div className="rsx-stat">
          <span className="rsx-stat-value">{block.value}</span>
          <div>
            <p className="rsx-stat-text">{block.text}</p>
            <p className="rsx-stat-note">{block.note}</p>
          </div>
        </div>
      );
    case "text":
      return (
        <div className="rsx-block">
          <h3>{block.title}</h3>
          <p className="rsx-text">{block.text}</p>
        </div>
      );
  }
}

export default function RealEstateGuidePage() {
  return (
    <>
      <Header />
      <main className="hlx-page">
        {/* Hero — landing page's dusk shell */}
        <section className="hero-v2">
          <div className="container hero-v2-container">
            <div className="hero-v2-content">
              <p className="hero-v2-eyebrow">Real estate guide · India</p>
              <h1 className="hero-v2-heading">
                <span>Buying property,</span>
                <em>explained plainly.</em>
              </h1>
              <p className="hero-v2-sub">
                Property types, RERA, documents, loans, hidden costs and legal
                checks: what to know before you pay a token amount.
              </p>
              <div className="hero-v2-cta-group">
                <Link href="#property-types" className="hero-v2-btn-primary">
                  Start reading
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/calculators" className="hero-v2-btn-ghost">
                  Try the calculators
                </Link>
              </div>
            </div>

            <figure className="hero-v2-tower idx-hero-art">
              <Image
                src="/guide.png"
                alt=""
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 30vw, 70vw"
                className="hero-v2-tower-img"
              />
            </figure>
          </div>
        </section>

        {/* Reading layout: sticky chapter list + chapters */}
        <div className="container rsx-guide">
          <nav className="rsx-toc" aria-label="Chapters">
            <p className="rsx-toc-label">In this guide</p>
            <ol>
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <a href={`#${c.id}`}>
                    <span>{i + 1}</span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="rsx-chapters">
            {chapters.map((c, i) => (
              <section key={c.id} id={c.id} className="rsx-chapter">
                <span className="featured-v2-eyebrow">Chapter {i + 1}</span>
                <h2 className="featured-v2-title">{c.title}</h2>
                <p className="rsx-summary">{c.summary}</p>
                {c.blocks.map((b, j) => (
                  <Block key={j} block={b} />
                ))}
              </section>
            ))}
            <p className="rsx-disclaimer">
              This guide is general information, not legal or tax advice.
              Rules and rates change, so confirm the details for your property
              with a lawyer or chartered accountant.
            </p>
          </div>
        </div>

        {/* Closing CTA — landing page's saffron band */}
        <section className="cta-v2">
          <div className="container cta-v2-inner">
            <h2 className="cta-v2-title">
              Ready to look?
              <em>Every listing is verified.</em>
            </h2>
            <div className="cta-v2-buttons">
              <Link href="/properties" className="cta-v2-btn-primary">
                Browse properties
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/calculators" className="cta-v2-btn-outline">
                Use the calculators
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
