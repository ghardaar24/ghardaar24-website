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
      // Add background shadow when scrolled
      setIsScrolled(window.scrollY > 500);

      // Find which section is currently active
      const sectionElements = sections
        .map((s) => ({
          id: s.id,
          element: document.getElementById(s.id),
        }))
        .filter((s) => s.element !== null);

      let currentActive = "";
      
      // Look for the section that is closest to the top of the viewport
      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          // Adjust offset as needed based on header height, etc
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
    // Run once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Header height + some padding
      const yOffset = -120; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <div className={`sticky top-24 z-40 w-full mb-8 py-3 px-4 md:px-6 transition-all duration-300 bg-white border border-slate-200 rounded-xl ${isScrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'shadow-sm'}`}>
      <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => scrollToSection(e, section.id)}
            className="relative font-medium text-sm md:text-base whitespace-nowrap transition-colors"
          >
            <span className={activeSection === section.id ? "text-primary" : "text-slate-600 hover:text-slate-900"}>
              {section.label}
            </span>
            {activeSection === section.id && (
              <motion.div
                layoutId="active-section-indicator"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
