"use client";

import { useState } from "react";
import { motion } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { Send, User, Phone, Mail, Home, CheckCircle } from "lucide-react";

const propertyTypes = ["Apartment", "House", "Villa", "Plot", "Commercial"];

const budgetRanges = [
  "Under ₹25 Lakhs",
  "₹25L - ₹50L",
  "₹50L - ₹1 Crore",
  "₹1Cr - ₹2Cr",
  "Above ₹2 Crores",
];

export default function LeadCaptureForm() {
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
      const { error } = await supabase
        .from("inquiries")
        .insert([
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
    <section className="lead-capture-section">
      <div className="container">
        <motion.div
          className="lead-capture-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="lead-capture-content">
            <div className="lead-capture-info">
              <span className="lead-capture-badge">Free Consultation</span>
              <h2 className="lead-capture-title">Get Expert Property Advice</h2>
              <p className="lead-capture-description">
                Fill in your details and our property experts will get back to
                you within 24 hours with personalized property recommendations.
              </p>

              <ul className="lead-capture-benefits">
                <li>
                  <CheckCircle className="w-5 h-5" />
                  <span>Free property consultation</span>
                </li>
                <li>
                  <CheckCircle className="w-5 h-5" />
                  <span>Personalized recommendations</span>
                </li>
                <li>
                  <CheckCircle className="w-5 h-5" />
                  <span>Home loan assistance</span>
                </li>
                <li>
                  <CheckCircle className="w-5 h-5" />
                  <span>Site visit scheduling</span>
                </li>
              </ul>
            </div>

            <div className="lead-capture-form-container">
              {isSubmitted ? (
                <motion.div
                  className="lead-capture-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="success-icon">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3>Thank You!</h3>
                  <p>
                    We&apos;ve received your inquiry. Our team will contact you
                    shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="lead-capture-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <User className="input-icon" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="propertyType">Property Type</label>
                      <div className="input-wrapper">
                        <Home className="input-icon" />
                        <select
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
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="budget">Budget</label>
                      <div className="input-wrapper">
                        <select
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
                        </select>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="lead-capture-submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-5 h-5" />
                    Get Free Consultation
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
