"use client";

import { useState, useEffect } from "react";
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
  MapPin,
  Building,
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
    state: "",
    city: "",
    propertyType: "",
    budget: "",
  });

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

      console.log("Form submitted successfully");
      setIsSubmitted(true);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        state: "",
        city: "",
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
    <section
      id="consultation"
      className="py-24 bg-gray-50 relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-50/50 -skew-x-12 translate-x-32 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Expert Info */}
          <motion.div
            className="flex flex-col text-center lg:text-left space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <span className="inline-block text-[#f36a2a] font-bold tracking-[0.2em] text-sm uppercase">
                Talk to our experts
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Our Expert Team
              </h2>
              <p className="text-xl text-gray-600 font-medium">
                Property Consultants
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <motion.a
                href="tel:+919673655631"
                className="group flex items-center gap-2 px-8 py-4 bg-[#f36a2a] text-white rounded-lg font-bold shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 hover:shadow-orange-300"
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Call Now
              </motion.a>

              <motion.a
                href="https://wa.me/919673655631?text=Hi! I'm interested in your properties."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-lg font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-1 hover:shadow-green-300"
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                WhatsApp
              </motion.a>

              <motion.a
                href="mailto:ghardaar24@gmail.com"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-lg font-bold hover:border-gray-300 hover:bg-gray-50 transition-all"
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-5 h-5" />
                Email
              </motion.a>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#f36a2a] to-[#e85f1f]" />

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Expert Property Advice
                </h3>
                <p className="text-gray-500">
                  Fill in your details and we'll get back to you within 24
                  hours.
                </p>
              </div>

              {isSubmitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    We&apos;ve received your inquiry. Our team will contact you
                    shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-700 ml-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="phone"
                      className="text-sm font-semibold text-gray-700 ml-1"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700 ml-1"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label
                        htmlFor="state"
                        className="text-sm font-semibold text-gray-700 ml-1"
                      >
                        State
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="state"
                          name="state"
                          className="block w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all appearance-none cursor-pointer"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select State</option>
                          {uniqueStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="city"
                        className="text-sm font-semibold text-gray-700 ml-1"
                      >
                        City
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="city"
                          name="city"
                          className="block w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all appearance-none cursor-pointer"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          disabled={!formData.state}
                        >
                          <option value="">Select City</option>
                          {availableCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label
                        htmlFor="propertyType"
                        className="text-sm font-semibold text-gray-700 ml-1"
                      >
                        Property Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="propertyType"
                          name="propertyType"
                          className="block w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all appearance-none cursor-pointer"
                          value={formData.propertyType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Type</option>
                          {propertyTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="budget"
                        className="text-sm font-semibold text-gray-700 ml-1"
                      >
                        Budget
                      </label>
                      <div className="relative">
                        <select
                          id="budget"
                          name="budget"
                          className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#f36a2a]/20 focus:border-[#f36a2a] transition-all appearance-none cursor-pointer"
                          value={formData.budget}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Budget</option>
                          {budgetRanges.map((range) => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#f36a2a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#e85f1f] transition-all shadow-lg shadow-orange-200 mt-4"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-5 h-5" />
                    Get Free Consultation
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
