import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// Promises that come with every deal
const promises = [
  {
    title: "Verified before you visit",
    icon: "/whyghardaar24/verified.png",
    description: "Our team checks every listing in person before it goes live.",
  },
  {
    title: "Zero brokerage",
    icon: "/whyghardaar24/zerobrokerage.png",
    description: "You pay the property's price and nothing on top. No hidden charges.",
  },
  {
    title: "Quick possession",
    icon: "/whyghardaar24/quickpossession.png",
    description: "We handle the documentation, so handover is fast and hassle-free.",
  },
];

// Optional services, each with its own page
const services = [
  {
    title: "Home loans",
    icon: "/whyghardaar24/homeloans.png",
    description: "Compare rates from our banking partners.",
    href: "/services/home-loans",
  },
  {
    title: "Interior design",
    icon: "/whyghardaar24/interior.png",
    description: "Plan and furnish your new home with our designers.",
    href: "/services/interior-design",
  },
  {
    title: "Vastu consultation",
    icon: "/whyghardaar24/vastu.png",
    description: "Expert guidance on layout and orientation.",
    href: "/services/vastu-consultation",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-v2">
      <div className="container">
        <header className="why-v2-header">
          <span className="featured-v2-eyebrow">Why Ghardaar24</span>
          <h2 className="featured-v2-title">
            Buying a home, <em>without the runaround.</em>
          </h2>
        </header>

        <div className="why-v2-grid">
          <div>
            <h3 className="why-v2-col-title">Included with every home</h3>
            <ul className="why-v2-promises">
              {promises.map((p) => (
                <li key={p.title}>
                  <Image
                    src={p.icon}
                    alt=""
                    width={72}
                    height={72}
                    className="why-v2-icon"
                  />
                  <div>
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="why-v2-services">
            <h3 className="why-v2-col-title">When you need more</h3>
            <ul>
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href}>
                    <Image
                      src={s.icon}
                      alt=""
                      width={56}
                      height={56}
                      className="why-v2-service-icon"
                    />
                    <span>
                      <strong>{s.title}</strong>
                      <span>{s.description}</span>
                    </span>
                    <ArrowUpRight className="why-v2-arrow" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
