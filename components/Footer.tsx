import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube } from "lucide-react";

const linkGroups = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All properties" },
      { href: "/properties?listing_type=sale", label: "Buy property" },
      { href: "/properties?listing_type=rent", label: "Rent property" },
      { href: "/calculators", label: "Calculators" },
      { href: "/real-estate-guide", label: "Real estate guide" },
      { href: "/downloads", label: "Downloads" },
    ],
  },
  {
    title: "Property types",
    links: [
      { href: "/properties?property_type=apartment", label: "Apartments" },
      { href: "/properties?property_type=house", label: "Houses" },
      { href: "/properties?property_type=villa", label: "Villas" },
      { href: "/properties?property_type=plot", label: "Plots" },
      { href: "/properties?property_type=commercial", label: "Commercial" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services/home-loans", label: "Home loans" },
      { href: "/services/interior-design", label: "Interior design" },
      { href: "/services/vastu-consultation", label: "Vastu consultation" },
    ],
  },
];

const socials = [
  { href: "https://www.instagram.com/ghardaar24", label: "Instagram", icon: Instagram },
  { href: "https://www.facebook.com/share/1BsxSR87Pm/?mibextid=wwXIfr", label: "Facebook", icon: Facebook },
  { href: "https://www.youtube.com/channel/UCGZv7IVyfV61fH_mq1O4WHQ", label: "YouTube", icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Link href="/" aria-label="Ghardaar24 home">
              <Image
                src="/logo3.png"
                alt="Ghardaar24"
                width={120}
                height={40}
                style={{ height: "40px", width: "auto" }}
              />
            </Link>
            <p>Verified homes to buy and rent in Pune, with zero brokerage.</p>
            <span className="site-footer-rera">RERA No. A31262500989</span>
          </div>

          <div className="site-footer-contact">
            <a href="tel:+919673655631">+91 96736 55631</a>
            <a href="mailto:ghardaar24@gmail.com">ghardaar24@gmail.com</a>
          </div>
        </div>

        <div className="site-footer-links">
          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h4>Follow</h4>
            <ul>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    <s.icon aria-hidden="true" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Ghardaar24. All rights reserved.</p>
          <p>
            Made by{" "}
            <a
              href="https://anahat-entertainment.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anahat Entertainment
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
