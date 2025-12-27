"use client";

import { motion } from "@/lib/motion";
import { Phone, MessageCircle, Mail, Award, Home } from "lucide-react";

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
            <div className="agent-info w-full text-center">
              <span className="agent-greeting">Talk to our experts</span>
              <h2 className="agent-name">Our Expert Team</h2>
              <p className="agent-title">Property Consultants</p>

              <div className="agent-stats justify-center mt-8">
                <div className="agent-stat">
                  <span className="agent-stat-value text-4xl">100%</span>
                  <span className="agent-stat-label">
                    Customer Satisfaction
                  </span>
                </div>
              </div>

              <div className="agent-actions">
                <motion.a
                  href="tel:+919673655631"
                  className="agent-btn agent-btn-primary"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </motion.a>
                <motion.a
                  href="https://wa.me/919673655631?text=Hi! I'm interested in your properties."
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
                  href="mailto:ghardaar24@gmail.com"
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
