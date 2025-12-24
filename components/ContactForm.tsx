"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Phone,
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

interface ContactFormProps {
  propertyId: string;
  propertyTitle: string;
  agentPhone?: string;
  agentEmail?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactForm({
  propertyId,
  propertyTitle,
  agentPhone = "+919876543210",
  agentEmail = "info@ghardaar24.com",
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: `Hi, I'm interested in "${propertyTitle}". Please provide more details.`,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const { error } = await supabase.from("inquiries").insert({
        property_id: propertyId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the property "${propertyTitle}". Please provide more details.`
  );

  const contactButtons = [
    {
      href: `tel:${agentPhone}`,
      className: "contact-btn contact-btn-call",
      icon: Phone,
      label: "Call Now",
    },
    {
      href: `https://wa.me/${agentPhone.replace(
        /[^0-9]/g,
        ""
      )}?text=${whatsappMessage}`,
      className: "contact-btn contact-btn-whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      target: "_blank",
    },
    {
      href: `mailto:${agentEmail}?subject=Inquiry: ${propertyTitle}`,
      className: "contact-btn contact-btn-email",
      icon: Mail,
      label: "Email",
    },
  ];

  return (
    <motion.div
      className="contact-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Quick Contact Buttons */}
      <div className="contact-buttons">
        {contactButtons.map((button, index) => (
          <motion.a
            key={button.label}
            href={button.href}
            className={button.className}
            target={button.target}
            rel={button.target ? "noopener noreferrer" : undefined}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button.icon className="w-5 h-5" />
            <span>{button.label}</span>
          </motion.a>
        ))}
      </div>

      {/* Contact Form */}
      <motion.div
        className="contact-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="contact-form-title">Send an Inquiry</h3>

        <AnimatePresence mode="wait">
          {submitStatus === "success" && (
            <motion.div
              className="form-alert form-alert-success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-5 h-5" />
              <span>
                Thank you! Your inquiry has been submitted successfully.
              </span>
            </motion.div>
          )}

          {submitStatus === "error" && (
            <motion.div
              className="form-alert form-alert-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Something went wrong. Please try again later.</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="contact-form">
          {[
            {
              name: "name",
              label: "Full Name *",
              type: "text",
              placeholder: "Enter your name",
            },
            {
              name: "email",
              label: "Email Address *",
              type: "email",
              placeholder: "Enter your email",
            },
            {
              name: "phone",
              label: "Phone Number *",
              type: "tel",
              placeholder: "Enter your phone number",
            },
          ].map((field, index) => (
            <motion.div
              key={field.name}
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <label htmlFor={field.name} className="form-label">
                {field.label}
              </label>
              <motion.input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof FormData]}
                onChange={handleChange}
                className={`form-input ${
                  errors[field.name as keyof FormErrors] ? "error" : ""
                }`}
                placeholder={field.placeholder}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <AnimatePresence>
                {errors[field.name as keyof FormErrors] && (
                  <motion.span
                    className="form-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {errors[field.name as keyof FormErrors]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="message" className="form-label">
              Message *
            </label>
            <motion.textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`form-input form-textarea ${
                errors.message ? "error" : ""
              }`}
              placeholder="Enter your message"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            />
            <AnimatePresence>
              {errors.message && (
                <motion.span
                  className="form-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {errors.message}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            type="submit"
            className="form-submit"
            disabled={isSubmitting}
            whileHover={{
              scale: isSubmitting ? 1 : 1.02,
              y: isSubmitting ? 0 : -2,
            }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <motion.span
                className="form-submit-loading"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Sending...
              </motion.span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Inquiry</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
