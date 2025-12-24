import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function InquiryCTA() {
  return (
    <div className="inquiry-cta-section">
      <div className="inquiry-cta-content">
        <div className="inquiry-icon-wrapper">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <div className="inquiry-text">
          <h3>Want to know more about this property?</h3>
          <p>
            Our experts are here to help you with detailed information, site
            visits, and best price negotiation.
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          document.getElementById("contact-form")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        className="inquiry-btn"
      >
        Send an Inquiry
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
