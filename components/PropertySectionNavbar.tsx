"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface PropertySection {
  id: string;
  label: string;
}

interface PropertySectionNavbarProps {
  sections: PropertySection[];
}

export default function PropertySectionNavbar({ sections }: PropertySectionNavbarProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");
  const [isScrolled, setIsScrolled] = useState(false);

  // isScrolled: rAF-throttled, no layout reads
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 500);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // activeSection: IntersectionObserver instead of getBoundingClientRect per scroll
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const firstVisible = sections.find((s) => visible.has(s.id));
        if (firstVisible) setActiveSection(firstVisible.id);
      },
      { rootMargin: "-120px 0px -60% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <div
      className="property-section-nav"
      style={{
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        boxShadow: isScrolled
          ? "0 4px 24px rgba(0,0,0,0.08)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div className="property-section-nav-inner">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => scrollToSection(e, section.id)}
              className="property-section-nav-item"
              data-active={isActive}
            >
              {isActive && (
                <motion.span
                  layoutId="section-nav-pill"
                  className="property-section-nav-pill"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 36 }}
                />
              )}
              <span className="property-section-nav-label">{section.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
