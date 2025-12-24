"use client";

import { motion } from "@/lib/motion";
import { Phone, MessageCircle, Mail, Award, Users, Home } from "lucide-react";

export default function AgentProfile() {
  return (
    <section className="agent-section">
      <div className="container">
        <motion.div
          className="agent-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="agent-content">
            <div className="agent-image-container">
              <div className="agent-image-wrapper">
                <div className="agent-image-placeholder">
                  <Home className="w-16 h-16" />
                </div>
              </div>
              <div className="agent-badge">
                <Award className="w-4 h-4" />
                <span>Top Agent</span>
              </div>
            </div>

            <div className="agent-info">
              <span className="agent-greeting">
                Hi, I'm your property expert
              </span>
              <h2 className="agent-name">Rahul Verma</h2>
              <p className="agent-title">Senior Property Consultant</p>

              <p className="agent-bio">
                With over 10 years of experience in the real estate industry,
                I've helped thousands of families find their dream homes. Let me
                guide you through your property journey with personalized
                service and expert advice.
              </p>

              <div className="agent-stats">
                <div className="agent-stat">
                  <span className="agent-stat-value">500+</span>
                  <span className="agent-stat-label">Properties Sold</span>
                </div>
                <div className="agent-stat">
                  <span className="agent-stat-value">10+</span>
                  <span className="agent-stat-label">Years Experience</span>
                </div>
                <div className="agent-stat">
                  <span className="agent-stat-value">1000+</span>
                  <span className="agent-stat-label">Happy Clients</span>
                </div>
              </div>

              <div className="agent-actions">
                <motion.a
                  href="tel:+919876543210"
                  className="agent-btn agent-btn-primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </motion.a>
                <motion.a
                  href="https://wa.me/919876543210?text=Hi! I'm interested in your properties."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agent-btn agent-btn-whatsapp"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </motion.a>
                <motion.a
                  href="mailto:info@ghardaar24.com"
                  className="agent-btn agent-btn-secondary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
