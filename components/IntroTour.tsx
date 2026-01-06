"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const INTRO_STORAGE_KEY = "ghardaar24_intro_completed";

export default function IntroTour() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    // Check if user has already seen the intro
    const hasSeenIntro = localStorage.getItem(INTRO_STORAGE_KEY);
    if (hasSeenIntro) return;

    // Wait for DOM elements to be ready
    const timeoutId = setTimeout(() => {
      startIntro();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [mounted, loading, user]);

  const startIntro = async () => {
    // Dynamically import intro.js only on client-side
    const introJs = (await import("intro.js")).default;
    // @ts-expect-error - CSS import doesn't have types
    await import("intro.js/introjs.css");
    
    const intro = introJs();

    // Minimal, professional tour steps
    const steps = [
      {
        element: "#intro-logo",
        intro: "Welcome to <strong>Ghardaar24</strong> — your trusted real estate partner.",
        position: "bottom" as const,
      },
      {
        element: "#intro-properties",
        intro: "Browse properties for <strong>Buy, Rent, or Resale</strong>.",
        position: "bottom" as const,
      },
      {
        element: "#intro-services",
        intro: "Explore our services — <strong>Home Loans, Interior Design & Vastu</strong>.",
        position: "bottom" as const,
      },
      ...(user
        ? [
            {
              element: "#intro-user-menu",
              intro: "Access your <strong>Dashboard</strong> to manage listings & saved properties.",
              position: "bottom" as const,
            },
          ]
        : [
            {
              element: "#intro-auth",
              intro: "<strong>Sign up</strong> to save properties and list your own.",
              position: "bottom" as const,
            },
          ]),
      {
        element: "#intro-search",
        intro: "Search by <strong>location, type, and budget</strong> to find your perfect home.",
        position: "top" as const,
      },
      {
        element: "#intro-contact",
        intro: "Connect with our <strong>experienced agents</strong> for personalized help.",
        position: "top" as const,
      },
      {
        intro: user 
          ? "Go to your dashboard and click <strong>'Submit Property'</strong> to list your property."
          : "<strong>Sign up</strong> to list your property and reach thousands of buyers.",
      },
    ];

    intro.setOptions({
      steps,
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: true,
      showStepNumbers: false,
      nextLabel: "Next",
      prevLabel: "Back",
      doneLabel: "Done",
      skipLabel: "✕",
      hidePrev: true,
      scrollToElement: true,
      scrollPadding: 80,
      overlayOpacity: 0.6,
    });

    intro.oncomplete(() => {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    });

    intro.onexit(() => {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    });

    intro.start();
  };

  return null;
}
