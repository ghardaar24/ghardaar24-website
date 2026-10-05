"use client";

import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  Phone,
  MessageCircle,
  Mail,
  CheckCircle,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

const propertyTypes = ["Apartment", "House", "Villa", "Plot", "Commercial"];

const budgetRanges = [
  "₹75L - ₹1 Crore",
  "₹1Cr - ₹1.5Cr",
  "₹1.5Cr - ₹2Cr",
  "₹2Cr - ₹3Cr",
  "Above ₹3 Crores",
];

const channels = [
  {
    icon: Phone,
    label: "Call",
    value: "+91 96736 55631",
    href: "tel:+919673655631",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/919673655631?text=Hi! I'm interested in your properties.",
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: "ghardaar24@gmail.com",
    href: "mailto:ghardaar24@gmail.com",
  },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  state: "",
  city: "",
  propertyType: "",
  budget: "",
};

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="contact-v2-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function SelectBox(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="contact-v2-select">
      <select {...props} />
      <ChevronDown aria-hidden="true" />
    </div>
  );
}

export default function AgentProfile() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const [locations, setLocations] = useState<{ state: string; city: string }[]>(
    []
  );

  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from("locations")
        .select("state, city")
        .eq("is_active", true);
      if (data) setLocations(data);
    }
    fetchLocations();
  }, []);

  const uniqueStates = Array.from(
    new Set(locations.map((l) => l.state))
  ).sort();
  const availableCities = locations
    .filter((l) => l.state === formData.state)
    .map((l) => l.city)
    .sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(false);

    const message = `Consultation Request:
Location: ${formData.city}, ${formData.state}
Property Type: ${formData.propertyType}
Budget: ${formData.budget}`;

    try {
      const { error } = await supabase.from("inquiries").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: message,
          // propert_id is null for general inquiries
        },
      ]);

      if (error) throw error;

      setIsSubmitted(true);
      setFormData(emptyForm);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error submitting form:", error instanceof Error ? error.message : "Unknown error");
      }
      setSubmitError(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="consultation" className="contact-v2">
      <div className="container contact-v2-grid">
        <div className="contact-v2-intro">
          <span className="contact-v2-eyebrow">Talk to us</span>
          <h2 className="contact-v2-title">
            Looking for a home in Pune?
            <em>Talk to a person.</em>
          </h2>
          <p className="contact-v2-sub">
            Share a few details and one of our property consultants will call
            you back within 24 hours. Prefer to talk now? Reach us directly.
          </p>

          <ul className="contact-v2-channels">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <c.icon className="contact-v2-channel-icon" aria-hidden="true" />
                  <span>
                    <small>{c.label}</small>
                    {c.value}
                  </span>
                  <ArrowUpRight className="contact-v2-channel-arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-v2-card">
          {isSubmitted ? (
            <div className="contact-v2-success" role="status">
              <CheckCircle aria-hidden="true" />
              <h3>Request received</h3>
              <p>A consultant will call you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-v2-form">
              <div className="contact-v2-form-head">
                <h3>Request a call back</h3>
                <p>We reply within 24 hours.</p>
              </div>

              <Field id="name" label="Full name">
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <div className="contact-v2-row">
                <Field id="phone" label="Phone number">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field id="email" label="Email">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </div>

              <div className="contact-v2-row">
                <Field id="state" label="State">
                  <SelectBox
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select state</option>
                    {uniqueStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </SelectBox>
                </Field>
                <Field id="city" label="City">
                  <SelectBox
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={!formData.state}
                  >
                    <option value="">
                      {formData.state ? "Select city" : "Pick a state first"}
                    </option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </SelectBox>
                </Field>
              </div>

              <div className="contact-v2-row">
                <Field id="propertyType" label="Property type">
                  <SelectBox
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </SelectBox>
                </Field>
                <Field id="budget" label="Budget">
                  <SelectBox
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select budget</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </SelectBox>
                </Field>
              </div>

              {submitError && (
                <p className="contact-v2-error" role="alert">
                  Your request didn&apos;t send. Check your connection and try
                  again, or call +91 96736 55631.
                </p>
              )}

              <button type="submit" className="contact-v2-submit">
                Request a call back
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
