"use client";

import { useState } from "react";
import { motion } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import {
  Phone,
  MessageCircle,
  Mail,
  User,
  Send,
  CheckCircle,
  Home,
} from "lucide-react";

const propertyTypes = ["Apartment", "House", "Villa", "Plot", "Commercial"];

const budgetRanges = [
  "₹75L - ₹1 Crore",
  "₹1Cr - ₹1.5Cr",
  "₹1.5Cr - ₹2Cr",
  "₹2Cr - ₹3Cr",
  "Above ₹3 Crores",
];

export default function AgentProfile() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyType: "",
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the message from structured data
    const message = `Consultation Request:
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

      console.log("Form submitted successfully");
      setIsSubmitted(true);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        propertyType: "",
        budget: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your request. Please try again.");
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
    <section id="consultation" className="agent-section py-16 bg-gray-50">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Expert Info */}
          <motion.div
            className="agent-info-col h-full flex flex-col justify-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="agent-content text-center lg:text-left">
              <span className="agent-greeting text-primary font-semibold tracking-wide uppercase text-sm">
                Talk to our experts
              </span>
              <h2 className="agent-name text-4xl font-bold mt-2 mb-2 text-gray-900">
                Our Expert Team
              </h2>
              <p className="agent-title text-xl text-gray-600 mb-8">
                Property Consultants
              </p>

              <div className="agent-stats flex justify-center lg:justify-start mb-10">
                <div className="agent-stat text-center lg:text-left">
                  <span className="agent-stat-value text-5xl font-bold text-primary block mb-1">
                    100%
                  </span>
                  <span className="agent-stat-label text-gray-500 font-medium">
                    Customer Satisfaction
                  </span>
                </div>
              </div>

              <div className="agent-actions flex flex-wrap justify-center lg:justify-start gap-4">
                <motion.a
                  href="tel:+919673655631"
                  className="agent-btn agent-btn-primary flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </motion.a>
                <motion.a
                  href="https://wa.me/919673655631?text=Hi! I'm interested in your properties."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agent-btn agent-btn-whatsapp flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-medium shadow-lg shadow-[#25D366]/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </motion.a>
                <motion.a
                  href="mailto:ghardaar24@gmail.com"
                  className="agent-btn agent-btn-secondary flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-5 h-5" />
                  Email
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            className="lead-capture-form-container bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Get Expert Property Advice
              </h3>
              <p className="text-gray-500">
                Fill in your details and we'll get back to you within 24 hours.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                className="lead-capture-success text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="success-icon flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-500">
                  We&apos;ve received your inquiry. Our team will contact you
                  shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="input-wrapper relative">
                    <User className="input-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="input-wrapper relative">
                    <Phone className="input-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="input-wrapper relative">
                    <Mail className="input-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label
                      htmlFor="propertyType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Type
                    </label>
                    <div className="input-wrapper relative">
                      <Home className="input-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="propertyType"
                        name="propertyType"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
                        value={formData.propertyType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Type</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Budget
                    </label>
                    <div className="input-wrapper relative">
                      <select
                        id="budget"
                        name="budget"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Budget</option>
                        {budgetRanges.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-5 h-5" />
                  Get Free Consultation
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
