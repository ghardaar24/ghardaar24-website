import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="nfx">
        <div className="container nfx-inner">
          {/* Signature: the door to nowhere stands in for the 0 */}
          <h1 className="nfx-code">
            <span aria-hidden="true">4</span>
            <Image
              src="/404.png"
              alt=""
              width={1254}
              height={1254}
              priority
              sizes="(min-width: 768px) 22rem, 50vw"
              className="nfx-door"
            />
            <span aria-hidden="true">4</span>
            <span className="sr-only">404: page not found</span>
          </h1>

          <p className="nfx-heading">
            Wrong door. <em>Let&apos;s get you home.</em>
          </p>
          <p className="nfx-sub">
            This page doesn&apos;t exist or has moved. If you followed a link
            to a listing, it may have been sold or taken down.
          </p>

          <div className="hero-v2-cta-group nfx-cta">
            <Link href="/properties" className="hero-v2-btn-primary">
              <Search className="w-5 h-5" />
              Browse properties
            </Link>
            <Link href="/" className="hero-v2-btn-ghost">
              Back to home
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="hero-v2-areas-label" id="nfx-areas-label">
            Or start with an area
          </p>
          <ul className="hero-v2-areas nfx-areas" aria-labelledby="nfx-areas-label">
            {["Baner", "Wakad", "Hinjewadi", "Kharadi", "Hadapsar"].map((area) => (
              <li key={area}>
                <Link href={`/properties?search=${area}`}>{area}</Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
