import { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Home,
  FileText,
  Shield,
  Landmark,
  IndianRupee,
  Scale,
  Building2,
  MapPin,
  Users,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Percent,
  FileCheck,
  Gavel,
  Building,
  Calculator,
} from "lucide-react";
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
};

const guideTopics = [
  {
    id: "property-types",
    title: "Types of Properties",
    icon: Building2,
    color: "#16a34a",
  },
  {
    id: "rera",
    title: "Understanding RERA",
    icon: Shield,
    color: "#2563eb",
  },
  {
    id: "documents",
    title: "Essential Documents",
    icon: FileText,
    color: "#f36a2a",
  },
  {
    id: "home-loans",
    title: "Home Loans",
    icon: Landmark,
    color: "#7c3aed",
  },
  {
    id: "costs",
    title: "Hidden Costs",
    icon: IndianRupee,
    color: "#dc2626",
  },
  {
    id: "legal",
    title: "Legal Aspects",
    icon: Scale,
    color: "#0891b2",
  },
];

export default function RealEstateGuidePage() {
  return (
    <>
      <Header />
      <main className="guide-page">
        {/* Hero Section */}
        <section className="guide-hero">
          <div className="container">
            <div className="guide-hero-content">
              <span className="section-label">
                <BookOpen className="w-4 h-4" />
                Real Estate Guide
              </span>
              <h1 className="guide-hero-title">
                Understanding Real Estate in India
              </h1>
              <p className="guide-hero-subtitle">
                Your comprehensive guide to property buying, legal requirements,
                financing options, and everything you need to know before
                investing in real estate in India.
              </p>
            </div>

            {/* Quick Jump Links */}
            <div className="guide-quick-links">
              {guideTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`#${topic.id}`}
                  className="guide-quick-link"
                >
                  <topic.icon
                    className="w-5 h-5"
                    style={{ color: topic.color }}
                  />
                  <span>{topic.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Types of Properties Section */}
        <section id="property-types" className="guide-section">
          <div className="container">
            <div className="guide-section-header">
              <div
                className="guide-section-icon"
                style={{ background: "rgba(22, 163, 74, 0.1)" }}
              >
                <Building2 className="w-6 h-6" style={{ color: "#16a34a" }} />
              </div>
              <h2 className="guide-section-title">Types of Properties</h2>
            </div>

            <div className="guide-content-grid">
              <div className="guide-card">
                <div className="guide-card-header">
                  <Home className="w-5 h-5" />
                  <h3>Residential Properties</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Apartments/Flats:</strong> Multi-storey buildings
                    with individual units. Most common in urban areas.
                  </li>
                  <li>
                    <strong>Independent Houses:</strong> Standalone homes with
                    own land, offering more privacy and space.
                  </li>
                  <li>
                    <strong>Villas:</strong> Premium independent homes, often in
                    gated communities with amenities.
                  </li>
                  <li>
                    <strong>Row Houses:</strong> Attached homes sharing walls
                    with neighbors, with individual entrances.
                  </li>
                  <li>
                    <strong>Plots/Land:</strong> Vacant land for custom
                    construction as per your needs.
                  </li>
                </ul>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <Building className="w-5 h-5" />
                  <h3>Commercial Properties</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Office Spaces:</strong> Dedicated workspaces in
                    commercial complexes.
                  </li>
                  <li>
                    <strong>Retail Shops:</strong> Ground-floor units for
                    businesses and stores.
                  </li>
                  <li>
                    <strong>Warehouses:</strong> Large storage facilities for
                    goods and inventory.
                  </li>
                  <li>
                    <strong>Industrial Land:</strong> Designated zones for
                    manufacturing units.
                  </li>
                </ul>
              </div>

              <div className="guide-card guide-card-highlight">
                <div className="guide-card-header">
                  <MapPin className="w-5 h-5" />
                  <h3>Freehold vs Leasehold</h3>
                </div>
                <div className="guide-comparison">
                  <div className="comparison-item">
                    <h4>Freehold Property</h4>
                    <p>
                      You own the property and land permanently. Full ownership
                      rights with no time limit. Can be inherited, sold, or
                      transferred freely.
                    </p>
                  </div>
                  <div className="comparison-divider"></div>
                  <div className="comparison-item">
                    <h4>Leasehold Property</h4>
                    <p>
                      You own the building but not the land. Ownership is for a
                      fixed period (usually 99 years). Land belongs to
                      government or authority.
                    </p>
                  </div>
                </div>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <Calculator className="w-5 h-5" />
                  <h3>Area Measurements</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Carpet Area:</strong> Actual usable floor area
                    inside the walls. This is what you can actually use.
                  </li>
                  <li>
                    <strong>Built-up Area:</strong> Carpet area + wall thickness
                    + balcony. Usually 10-15% more than carpet area.
                  </li>
                  <li>
                    <strong>Super Built-up Area:</strong> Built-up area + share
                    of common areas (lobby, stairs, etc.). Usually 25-30% more
                    than carpet area.
                  </li>
                </ul>
                <div className="guide-tip">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Always ask for carpet area when comparing properties. RERA
                    mandates pricing based on carpet area.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RERA Section */}
        <section id="rera" className="guide-section guide-section-alt">
          <div className="container">
            <div className="guide-section-header">
              <div
                className="guide-section-icon"
                style={{ background: "rgba(37, 99, 235, 0.1)" }}
              >
                <Shield className="w-6 h-6" style={{ color: "#2563eb" }} />
              </div>
              <h2 className="guide-section-title">Understanding RERA</h2>
            </div>

            <div className="guide-content-grid">
              <div className="guide-card guide-card-full">
                <div className="guide-card-header">
                  <HelpCircle className="w-5 h-5" />
                  <h3>What is RERA?</h3>
                </div>
                <p className="guide-text">
                  <strong>
                    Real Estate (Regulation and Development) Act, 2016
                  </strong>{" "}
                  is a landmark legislation to protect home buyers and ensure
                  transparency in real estate transactions. It mandates
                  registration of all real estate projects and agents with the
                  regulatory authority.
                </p>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <CheckCircle className="w-5 h-5" />
                  <h3>Key Benefits for Buyers</h3>
                </div>
                <ul className="guide-list guide-list-check">
                  <li>Mandatory project registration before sales</li>
                  <li>70% of funds kept in escrow account</li>
                  <li>Standardized carpet area definition</li>
                  <li>Penalty for project delays</li>
                  <li>5-year defect liability period</li>
                  <li>Single-window complaint redressal</li>
                  <li>No changes without buyer consent</li>
                </ul>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <FileCheck className="w-5 h-5" />
                  <h3>How to Verify RERA Registration</h3>
                </div>
                <ol className="guide-list guide-list-numbered">
                  <li>
                    Visit your state&apos;s RERA website (e.g., MahaRERA for
                    Maharashtra)
                  </li>
                  <li>
                    Search by project name, promoter name, or RERA number
                  </li>
                  <li>Check project status, completion date, and approvals</li>
                  <li>Verify the agent&apos;s registration if applicable</li>
                  <li>Review quarterly progress reports</li>
                </ol>
                <div className="guide-tip guide-tip-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Always verify the RERA number mentioned in advertisements
                    and agreements.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Essential Documents Section */}
        <section id="documents" className="guide-section">
          <div className="container">
            <div className="guide-section-header">
              <div
                className="guide-section-icon"
                style={{ background: "rgba(243, 106, 42, 0.1)" }}
              >
                <FileText className="w-6 h-6" style={{ color: "#f36a2a" }} />
              </div>
              <h2 className="guide-section-title">Essential Documents</h2>
            </div>

            <div className="guide-content-grid">
              <div className="guide-card">
                <div className="guide-card-header">
                  <FileText className="w-5 h-5" />
                  <h3>Documents to Verify Before Buying</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Title Deed:</strong> Proves the seller&apos;s
                    ownership rights over the property.
                  </li>
                  <li>
                    <strong>Encumbrance Certificate (EC):</strong> Shows the
                    property is free from legal dues and mortgages.
                  </li>
                  <li>
                    <strong>Approved Building Plan:</strong> Sanctioned layout
                    from municipal authorities.
                  </li>
                  <li>
                    <strong>Commencement Certificate:</strong> Permission to
                    start construction.
                  </li>
                  <li>
                    <strong>Occupancy Certificate (OC):</strong> Certifies
                    building is fit for occupation per approved plans.
                  </li>
                  <li>
                    <strong>Completion Certificate (CC):</strong> Confirms
                    construction is complete as per approved plans.
                  </li>
                  <li>
                    <strong>NOCs:</strong> No Objection Certificates from fire,
                    water, electricity departments.
                  </li>
                </ul>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <Gavel className="w-5 h-5" />
                  <h3>Documents for Property Registration</h3>
                </div>
                <ul className="guide-list">
                  <li>Sale Deed (most important legal document)</li>
                  <li>Property tax receipts</li>
                  <li>Identity proof of buyer and seller</li>
                  <li>Address proof of both parties</li>
                  <li>Passport-size photographs</li>
                  <li>PAN card of both parties</li>
                  <li>Power of Attorney (if applicable)</li>
                  <li>Society NOC (for resale properties)</li>
                </ul>
              </div>

              <div className="guide-card guide-card-highlight">
                <div className="guide-card-header">
                  <AlertTriangle className="w-5 h-5" />
                  <h3>Red Flags to Watch Out For</h3>
                </div>
                <ul className="guide-list guide-list-warning">
                  <li>Property without clear title or disputed ownership</li>
                  <li>Missing or expired approvals and certificates</li>
                  <li>Developer not registered with RERA</li>
                  <li>Undisclosed pending litigation</li>
                  <li>Unregistered sale agreement</li>
                  <li>Pressure to pay in cash without receipts</li>
                  <li>Significant deviation from approved plans</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Home Loans Section */}
        <section id="home-loans" className="guide-section guide-section-alt">
          <div className="container">
            <div className="guide-section-header">
              <div
                className="guide-section-icon"
                style={{ background: "rgba(124, 58, 237, 0.1)" }}
              >
                <Landmark className="w-6 h-6" style={{ color: "#7c3aed" }} />
              </div>
              <h2 className="guide-section-title">Home Loans in India</h2>
            </div>

            <div className="guide-content-grid">
              <div className="guide-card">
                <div className="guide-card-header">
                  <Percent className="w-5 h-5" />
                  <h3>Types of Home Loans</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Home Purchase Loan:</strong> For buying ready or
                    under-construction property.
                  </li>
                  <li>
                    <strong>Home Construction Loan:</strong> For building a
                    house on owned land.
                  </li>
                  <li>
                    <strong>Home Extension Loan:</strong> For adding more space
                    to existing property.
                  </li>
                  <li>
                    <strong>Home Renovation Loan:</strong> For repairs and
                    improvements.
                  </li>
                  <li>
                    <strong>Land Purchase Loan:</strong> For buying a plot
                    (usually lower LTV ratio).
                  </li>
                  <li>
                    <strong>Balance Transfer:</strong> To move existing loan to
                    another bank for better rates.
                  </li>
                </ul>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <CheckCircle className="w-5 h-5" />
                  <h3>Eligibility Factors</h3>
                </div>
                <ul className="guide-list guide-list-check">
                  <li>Age (21-65 years typically)</li>
                  <li>Monthly income and job stability</li>
                  <li>Credit score (750+ is ideal)</li>
                  <li>Existing EMI obligations</li>
                  <li>Property value and location</li>
                  <li>Employment type (salaried/self-employed)</li>
                </ul>
                <div className="guide-tip">
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    Banks typically approve EMI up to 45-50% of your net monthly
                    income.
                  </span>
                </div>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <IndianRupee className="w-5 h-5" />
                  <h3>Important Terms to Know</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>LTV Ratio:</strong> Loan-to-Value ratio. Banks
                    finance 75-90% of property value.
                  </li>
                  <li>
                    <strong>EMI:</strong> Equated Monthly Installment - fixed
                    monthly payment.
                  </li>
                  <li>
                    <strong>Interest Types:</strong> Fixed rate stays same;
                    Floating rate varies with market.
                  </li>
                  <li>
                    <strong>Processing Fee:</strong> Usually 0.25-1% of loan
                    amount.
                  </li>
                  <li>
                    <strong>Prepayment:</strong> Paying extra to reduce loan
                    tenure or EMI.
                  </li>
                </ul>
              </div>

              <div className="guide-card guide-card-highlight">
                <div className="guide-card-header">
                  <Calculator className="w-5 h-5" />
                  <h3>Tax Benefits on Home Loans</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Section 80C:</strong> Deduction up to ₹1.5 lakh on
                    principal repayment.
                  </li>
                  <li>
                    <strong>Section 24(b):</strong> Deduction up to ₹2 lakh on
                    interest payment (self-occupied).
                  </li>
                  <li>
                    <strong>Section 80EEA:</strong> Additional ₹1.5 lakh for
                    first-time buyers (conditions apply).
                  </li>
                </ul>
                <div className="guide-tip guide-tip-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Joint home loans with spouse can help claim higher total
                    deductions.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hidden Costs Section */}
        <section id="costs" className="guide-section">
          <div className="container">
            <div className="guide-section-header">
              <div
                className="guide-section-icon"
                style={{ background: "rgba(220, 38, 38, 0.1)" }}
              >
                <IndianRupee className="w-6 h-6" style={{ color: "#dc2626" }} />
              </div>
              <h2 className="guide-section-title">
                Hidden Costs in Property Buying
              </h2>
            </div>

            <div className="guide-content-grid">
              <div className="guide-card">
                <div className="guide-card-header">
                  <FileCheck className="w-5 h-5" />
                  <h3>Stamp Duty & Registration</h3>
                </div>
                <p className="guide-text">
                  <strong>Stamp Duty</strong> varies by state (typically 4-8%
                  for males, sometimes lower for females).
                  <strong> Registration charges</strong> are usually 1% of
                  property value or a fixed amount.
                </p>
                <div className="guide-note">
                  Example: In Maharashtra, stamp duty is 5% (4% for females in
                  urban areas) + 1% registration + LBT where applicable.
                </div>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <Building2 className="w-5 h-5" />
                  <h3>Builder & Society Charges</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>GST:</strong> 5% on under-construction (1% for
                    affordable housing). Not applicable on OC-received
                    properties.
                  </li>
                  <li>
                    <strong>Preferred Location Charge (PLC):</strong> Extra for
                    corner units, garden-facing, etc.
                  </li>
                  <li>
                    <strong>Parking Charges:</strong> ₹2-10 lakh for covered
                    parking.
                  </li>
                  <li>
                    <strong>Club/Amenity Charges:</strong> One-time fee for
                    access to facilities.
                  </li>
                  <li>
                    <strong>Maintenance Deposit:</strong> Usually 12-24 months
                    advance.
                  </li>
                </ul>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <IndianRupee className="w-5 h-5" />
                  <h3>Ongoing Costs</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Property Tax:</strong> Annual tax to municipal
                    corporation.
                  </li>
                  <li>
                    <strong>Maintenance:</strong> Monthly society maintenance
                    (₹2-15 per sq ft).
                  </li>
                  <li>
                    <strong>Home Insurance:</strong> Recommended annual premium.
                  </li>
                  <li>
                    <strong>Utility Bills:</strong> Electricity, water, gas,
                    internet.
                  </li>
                </ul>
              </div>

              <div className="guide-card guide-card-highlight">
                <div className="guide-card-header">
                  <Calculator className="w-5 h-5" />
                  <h3>Budget Planning Rule</h3>
                </div>
                <div className="guide-highlight-text">
                  <span className="highlight-number">10-15%</span>
                  <span className="highlight-desc">
                    Keep aside this much of property value for additional costs
                    beyond the base price.
                  </span>
                </div>
                <p className="guide-text">
                  For a ₹50 lakh property, budget ₹5-7.5 lakh extra for stamp
                  duty, registration, GST, society charges, and moving costs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Aspects Section */}
        <section id="legal" className="guide-section guide-section-alt">
          <div className="container">
            <div className="guide-section-header">
              <div
                className="guide-section-icon"
                style={{ background: "rgba(8, 145, 178, 0.1)" }}
              >
                <Scale className="w-6 h-6" style={{ color: "#0891b2" }} />
              </div>
              <h2 className="guide-section-title">Legal Aspects</h2>
            </div>

            <div className="guide-content-grid">
              <div className="guide-card">
                <div className="guide-card-header">
                  <Gavel className="w-5 h-5" />
                  <h3>Due Diligence Checklist</h3>
                </div>
                <ul className="guide-list guide-list-check">
                  <li>Verify seller&apos;s identity and ownership</li>
                  <li>Check for clear, marketable title</li>
                  <li>Get 30+ years of ownership chain</li>
                  <li>Verify all approvals and NOCs</li>
                  <li>Check for pending charges or mortgages</li>
                  <li>Confirm no litigation on property</li>
                  <li>Verify property tax payments are current</li>
                  <li>Check if property matches approved plan</li>
                </ul>
              </div>

              <div className="guide-card">
                <div className="guide-card-header">
                  <FileText className="w-5 h-5" />
                  <h3>Key Legal Documents</h3>
                </div>
                <ul className="guide-list">
                  <li>
                    <strong>Sale Deed:</strong> Final transfer document
                    registered at Sub-Registrar office.
                  </li>
                  <li>
                    <strong>Agreement to Sale:</strong> Preliminary contract
                    outlining terms.
                  </li>
                  <li>
                    <strong>Power of Attorney:</strong> Authorization to act on
                    behalf of owner.
                  </li>
                  <li>
                    <strong>Mother Deed:</strong> Original deed tracing
                    property ownership.
                  </li>
                  <li>
                    <strong>Khata Certificate:</strong> Property registered in
                    owner&apos;s name in municipal records.
                  </li>
                </ul>
              </div>

              <div className="guide-card guide-card-full">
                <div className="guide-card-header">
                  <Users className="w-5 h-5" />
                  <h3>When to Hire Professionals</h3>
                </div>
                <div className="guide-professionals">
                  <div className="professional-item">
                    <h4>Property Lawyer</h4>
                    <p>
                      For title verification, document review, and legal due
                      diligence. Essential for high-value or complex
                      transactions.
                    </p>
                  </div>
                  <div className="professional-item">
                    <h4>Chartered Accountant</h4>
                    <p>
                      For tax planning, capital gains calculation, and
                      optimizing deductions on home loan.
                    </p>
                  </div>
                  <div className="professional-item">
                    <h4>Property Valuer</h4>
                    <p>
                      For fair market value assessment, especially for resale
                      properties or loan purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="guide-cta">
          <div className="container">
            <div className="guide-cta-card">
              <h2>Ready to Start Your Property Search?</h2>
              <p>
                Now that you understand the basics, explore verified properties
                listed on Ghardaar24 with complete transparency.
              </p>
              <div className="guide-cta-buttons">
                <Link href="/properties" className="guide-cta-btn">
                  Browse Properties
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/calculators" className="guide-cta-btn-secondary">
                  <Calculator className="w-5 h-5" />
                  Use Our Calculators
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
