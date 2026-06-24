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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 500);

      const sectionElements = sections
        .map((s) => ({ id: s.id, element: document.getElementById(s.id) }))
        .filter((s) => s.element !== null);

      let currentActive = "";
      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentActive = section.id;
            break;
          }
        }
      }

      if (currentActive && currentActive !== activeSection) {
        setActiveSection(currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

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
