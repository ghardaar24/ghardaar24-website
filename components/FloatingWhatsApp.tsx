"use client";

import { motion } from "@/lib/motion";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export default function FloatingWhatsApp({
  phoneNumber = "919876543210",
  message = "Hi! I'm interested in your properties. Please share more details.",
}: FloatingWhatsAppProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and delay appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hide on admin pages or not mounted
  if (!mounted || pathname?.startsWith("/admin")) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      <div className="whatsapp-pulse" />
      <div className="whatsapp-icon">
        <MessageCircle className="w-7 h-7" />
      </div>
      <span className="whatsapp-tooltip">Chat with us</span>
    </motion.a>
  );
}
