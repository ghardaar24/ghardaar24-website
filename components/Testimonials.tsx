"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    image: "/testimonials/customer1.jpg",
    rating: 5,
    text: "Ghardaar24 made finding my dream home incredibly easy. Their team was professional and helped me through every step of the buying process.",
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Delhi NCR",
    image: "/testimonials/customer2.jpg",
    rating: 5,
    text: "Excellent service! They understood exactly what I was looking for and showed me properties that matched my budget and preferences perfectly.",
  },
  {
    id: 3,
    name: "Amit Patel",
    location: "Bangalore, Karnataka",
    image: "/testimonials/customer3.jpg",
    rating: 5,
    text: "The virtual tours feature saved me so much time. I could shortlist properties from home before visiting. Highly recommended!",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title-new">What Our Customers Say</h2>
          <p className="section-subtitle">
            Trusted by thousands of happy homeowners across India
          </p>
        </motion.div>

        <motion.div
          className="testimonials-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card"
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="testimonial-quote-icon">
                <Quote className="w-8 h-8" />
              </div>

              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="testimonial-text">{testimonial.text}</p>

              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <div className="avatar-placeholder">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div className="testimonial-author-info">
                  <span className="testimonial-name">{testimonial.name}</span>
                  <span className="testimonial-location">
                    {testimonial.location}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
