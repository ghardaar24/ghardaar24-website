"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  Home,
  Palette,
  Ruler,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Landmark,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

type ServiceType = "home_loan" | "interior_design" | "vastu_consultation";

interface ConsultationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType;
}

interface HomeLoanFormData {
  name: string;
  email: string;
  phone: string;
  employmentType: string;
  monthlyIncome: string;
  loanAmount: string;
  propertyType: string;
  preferredBanks: string;
  message: string;
}

interface InteriorDesignFormData {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  propertySize: string;
  roomsToDesign: string[];
  designStyle: string;
  budgetRange: string;
  timeline: string;
  message: string;
}

interface VastuConsultationFormData {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  consultationType: string;
  preferredDate: string;
  propertyAddress: string;
  issues: string[];
  message: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const employmentTypes = ["Salaried", "Self-Employed", "Business Owner", "Professional"];
const incomeRanges = [
  "Below ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000 - ₹2,00,000",
  "Above ₹2,00,000",
];
const loanAmounts = [
  "Up to ₹25 Lakhs",
  "₹25-50 Lakhs",
  "₹50 Lakhs - 1 Crore",
  "₹1-2 Crore",
  "Above ₹2 Crore",
];
const loanPropertyTypes = ["Ready to Move", "Under Construction", "Resale Property", "Plot/Land"];
const preferredBanksList = ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak", "LIC HFL", "Any Bank"];

const interiorPropertyTypes = ["Apartment", "House", "Villa", "Penthouse", "Commercial Space"];
const designStyles = [
  "Contemporary",
  "Minimalist",
  "Traditional Indian",
  "Modern Luxury",
  "Scandinavian",
  "Industrial",
];
const budgetRanges = [
  "Up to ₹5 Lakhs",
  "₹5-10 Lakhs",
  "₹10-20 Lakhs",
  "₹20-50 Lakhs",
  "Above ₹50 Lakhs",
];
const timelineOptions = [
  "Immediately",
  "Within 1 Month",
  "1-3 Months",
  "3-6 Months",
  "Flexible",
];
const roomOptions = [
  "Living Room",
  "Master Bedroom",
  "Kids Room",
  "Kitchen",
  "Bathroom",
  "Dining Area",
  "Study/Office",
  "Balcony",
  "Full Home",
];

const vastuPropertyTypes = ["Residential", "Commercial", "Industrial", "Plot/Land", "Under Construction"];
const vastuConsultationTypes = ["On-site Visit", "Online Consultation", "Map/Plan Analysis"];
const vastuIssues = [
  "New Property Selection",
  "Existing Property Correction",
  "Renovation Planning",
  "Health Issues",
  "Financial Growth",
  "Relationship Harmony",
  "Career/Business Growth",
];

export default function ConsultationFormModal({
  isOpen,
  onClose,
  serviceType,
}: ConsultationFormModalProps) {
  const [homeLoanData, setHomeLoanData] = useState<HomeLoanFormData>({
    name: "",
    email: "",
    phone: "",
    employmentType: "",
    monthlyIncome: "",
    loanAmount: "",
    propertyType: "",
    preferredBanks: "",
    message: "",
  });

  const [interiorData, setInteriorData] = useState<InteriorDesignFormData>({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    propertySize: "",
    roomsToDesign: [],
    designStyle: "",
    budgetRange: "",
    timeline: "",
    message: "",
  });

  const [vastuData, setVastuData] = useState<VastuConsultationFormData>({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    consultationType: "",
    preferredDate: "",
    propertyAddress: "",
    issues: [],
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const data =
      serviceType === "home_loan"
        ? homeLoanData
        : serviceType === "interior_design"
        ? interiorData
        : vastuData;

    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!data.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[+]?[\d\s-]{10,}$/.test(data.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (serviceType === "home_loan") {
      if (!homeLoanData.employmentType) {
        newErrors.employmentType = "Please select employment type";
      }
      if (!homeLoanData.loanAmount) {
        newErrors.loanAmount = "Please select loan amount required";
      }
    } else if (serviceType === "interior_design") {
      if (!interiorData.propertyType) {
        newErrors.propertyType = "Please select property type";
      }
      if (!interiorData.budgetRange) {
        newErrors.budgetRange = "Please select budget range";
      }
    } else {
      if (!vastuData.propertyType) {
        newErrors.propertyType = "Please select property type";
      }
      if (!vastuData.consultationType) {
        newErrors.consultationType = "Please select consultation type";
      }
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
      const data =
        serviceType === "home_loan"
          ? homeLoanData
          : serviceType === "interior_design"
          ? interiorData
          : vastuData;
      const serviceDetails =
        serviceType === "home_loan"
          ? {
              employment_type: homeLoanData.employmentType,
              monthly_income: homeLoanData.monthlyIncome,
              loan_amount: homeLoanData.loanAmount,
              property_type: homeLoanData.propertyType,
              preferred_banks: homeLoanData.preferredBanks,
            }
          : serviceType === "interior_design"
          ? {
              property_type: interiorData.propertyType,
              property_size: interiorData.propertySize,
              rooms_to_design: interiorData.roomsToDesign,
              design_style: interiorData.designStyle,
              budget_range: interiorData.budgetRange,
              timeline: interiorData.timeline,
            }
          : {
              property_type: vastuData.propertyType,
              consultation_type: vastuData.consultationType,
              preferred_date: vastuData.preferredDate,
              property_address: vastuData.propertyAddress,
              issues: vastuData.issues,
            };

      const { error } = await supabase.from("inquiries").insert({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        message:
          data.message.trim() ||
          `${
            serviceType === "home_loan"
              ? "Home Loan"
              : serviceType === "interior_design"
              ? "Interior Design"
              : "Vastu"
          } consultation request`,
        inquiry_type: serviceType,
        service_details: serviceDetails,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitStatus("success");
      
      // Reset form after 2 seconds
      setTimeout(() => {
        if (serviceType === "home_loan") {
          setHomeLoanData({
            name: "",
            email: "",
            phone: "",
            employmentType: "",
            monthlyIncome: "",
            loanAmount: "",
            propertyType: "",
            preferredBanks: "",
            message: "",
          });
        } else if (serviceType === "interior_design") {
          setInteriorData({
            name: "",
            email: "",
            phone: "",
            propertyType: "",
            propertySize: "",
            roomsToDesign: [],
            designStyle: "",
            budgetRange: "",
            timeline: "",
            message: "",
          });
        } else {
          setVastuData({
            name: "",
            email: "",
            phone: "",
            propertyType: "",
            consultationType: "",
            preferredDate: "",
            propertyAddress: "",
            issues: [],
            message: "",
          });
        }
        onClose();
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHomeLoanChange = (field: keyof HomeLoanFormData, value: string) => {
    setHomeLoanData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInteriorChange = (
    field: keyof InteriorDesignFormData,
    value: string | string[]
  ) => {
    setInteriorData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleRoom = (room: string) => {
    setInteriorData((prev) => ({
      ...prev,
      roomsToDesign: prev.roomsToDesign.includes(room)
        ? prev.roomsToDesign.filter((r) => r !== room)
        : [...prev.roomsToDesign, room],
    }));
  };

  const handleVastuChange = (
    field: keyof VastuConsultationFormData,
    value: string | string[]
  ) => {
    setVastuData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleVastuIssue = (issue: string) => {
    setVastuData((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="consultation-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="consultation-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="consultation-modal-header">
            <div className="consultation-modal-title">
              {serviceType === "home_loan" ? (
                <>
                  <Landmark className="w-6 h-6" />
                  <h2>Home Loan Consultation</h2>
                </>
              ) : serviceType === "interior_design" ? (
                <>
                  <Palette className="w-6 h-6" />
                  <h2>Interior Design Consultation</h2>
                </>
              ) : (
                <>
                  <Compass className="w-6 h-6" />
                  <h2>Vastu Consultation</h2>
                </>
              )}
            </div>
            <motion.button
              className="consultation-modal-close"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="consultation-modal-body">
            <AnimatePresence mode="wait">
              {submitStatus === "success" ? (
                <motion.div
                  className="consultation-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <CheckCircle className="w-16 h-16" />
                  <h3>Thank You!</h3>
                  <p>
                    We&apos;ve received your consultation request. Our team will
                    contact you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="consultation-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {submitStatus === "error" && (
                    <motion.div
                      className="consultation-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>Something went wrong. Please try again.</span>
                    </motion.div>
                  )}

                  {/* Personal Information Section */}
                  <div className="consultation-section">
                    <h3 className="consultation-section-title">Personal Information</h3>
                    <div className="consultation-form-grid">
                      <div className="consultation-form-group">
                        <label>
                          <User className="w-4 h-4" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={
                            serviceType === "home_loan"
                              ? homeLoanData.name
                              : serviceType === "interior_design"
                              ? interiorData.name
                              : vastuData.name
                          }
                          onChange={(e) =>
                            serviceType === "home_loan"
                              ? handleHomeLoanChange("name", e.target.value)
                              : serviceType === "interior_design"
                              ? handleInteriorChange("name", e.target.value)
                              : handleVastuChange("name", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className={errors.name ? "error" : ""}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                      </div>

                      <div className="consultation-form-group">
                        <label>
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={
                            serviceType === "home_loan"
                              ? homeLoanData.email
                              : serviceType === "interior_design"
                              ? interiorData.email
                              : vastuData.email
                          }
                          onChange={(e) =>
                            serviceType === "home_loan"
                              ? handleHomeLoanChange("email", e.target.value)
                              : serviceType === "interior_design"
                              ? handleInteriorChange("email", e.target.value)
                              : handleVastuChange("email", e.target.value)
                          }
                          placeholder="Enter your email"
                          className={errors.email ? "error" : ""}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>

                      <div className="consultation-form-group">
                        <label>
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={
                            serviceType === "home_loan"
                              ? homeLoanData.phone
                              : serviceType === "interior_design"
                              ? interiorData.phone
                              : vastuData.phone
                          }
                          onChange={(e) =>
                            serviceType === "home_loan"
                              ? handleHomeLoanChange("phone", e.target.value)
                              : serviceType === "interior_design"
                              ? handleInteriorChange("phone", e.target.value)
                              : handleVastuChange("phone", e.target.value)
                          }
                          placeholder="Enter your phone number"
                          className={errors.phone ? "error" : ""}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Service-Specific Fields */}
                  {serviceType === "home_loan" ? (
                    <>
                      <div className="consultation-section">
                        <h3 className="consultation-section-title">Employment Details</h3>
                        <div className="consultation-form-grid">
                          <div className="consultation-form-group">
                            <label>
                              <Briefcase className="w-4 h-4" />
                              Employment Type *
                            </label>
                            <select
                              value={homeLoanData.employmentType}
                              onChange={(e) => handleHomeLoanChange("employmentType", e.target.value)}
                              className={errors.employmentType ? "error" : ""}
                            >
                              <option value="">Select employment type</option>
                              {employmentTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            {errors.employmentType && (
                              <span className="error-text">{errors.employmentType}</span>
                            )}
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <IndianRupee className="w-4 h-4" />
                              Monthly Income
                            </label>
                            <select
                              value={homeLoanData.monthlyIncome}
                              onChange={(e) => handleHomeLoanChange("monthlyIncome", e.target.value)}
                            >
                              <option value="">Select income range</option>
                              {incomeRanges.map((range) => (
                                <option key={range} value={range}>
                                  {range}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="consultation-section">
                        <h3 className="consultation-section-title">Loan Requirements</h3>
                        <div className="consultation-form-grid">
                          <div className="consultation-form-group">
                            <label>
                              <IndianRupee className="w-4 h-4" />
                              Loan Amount Required *
                            </label>
                            <select
                              value={homeLoanData.loanAmount}
                              onChange={(e) => handleHomeLoanChange("loanAmount", e.target.value)}
                              className={errors.loanAmount ? "error" : ""}
                            >
                              <option value="">Select loan amount</option>
                              {loanAmounts.map((amount) => (
                                <option key={amount} value={amount}>
                                  {amount}
                                </option>
                              ))}
                            </select>
                            {errors.loanAmount && (
                              <span className="error-text">{errors.loanAmount}</span>
                            )}
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <Home className="w-4 h-4" />
                              Property Type
                            </label>
                            <select
                              value={homeLoanData.propertyType}
                              onChange={(e) => handleHomeLoanChange("propertyType", e.target.value)}
                            >
                              <option value="">Select property type</option>
                              {loanPropertyTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="consultation-form-group full-width">
                            <label>Preferred Banks (Optional)</label>
                            <div className="consultation-chips">
                              {preferredBanksList.map((bank) => (
                                <motion.button
                                  key={bank}
                                  type="button"
                                  className={`consultation-chip ${
                                    homeLoanData.preferredBanks === bank ? "active" : ""
                                  }`}
                                  onClick={() => handleHomeLoanChange("preferredBanks", bank)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {bank}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : serviceType === "interior_design" ? (
                    <>
                      <div className="consultation-section">
                        <h3 className="consultation-section-title">Property Details</h3>
                        <div className="consultation-form-grid">
                          <div className="consultation-form-group">
                            <label>
                              <Home className="w-4 h-4" />
                              Property Type *
                            </label>
                            <select
                              value={interiorData.propertyType}
                              onChange={(e) =>
                                handleInteriorChange("propertyType", e.target.value)
                              }
                              className={errors.propertyType ? "error" : ""}
                            >
                              <option value="">Select property type</option>
                              {interiorPropertyTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            {errors.propertyType && (
                              <span className="error-text">{errors.propertyType}</span>
                            )}
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <Ruler className="w-4 h-4" />
                              Property Size (sq.ft.)
                            </label>
                            <input
                              type="text"
                              value={interiorData.propertySize}
                              onChange={(e) =>
                                handleInteriorChange("propertySize", e.target.value)
                              }
                              placeholder="e.g., 1200"
                            />
                          </div>
                        </div>

                        <div className="consultation-form-group full-width">
                          <label>Rooms to Design</label>
                          <div className="consultation-chips">
                            {roomOptions.map((room) => (
                              <motion.button
                                key={room}
                                type="button"
                                className={`consultation-chip ${
                                  interiorData.roomsToDesign.includes(room) ? "active" : ""
                                }`}
                                onClick={() => toggleRoom(room)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {room}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="consultation-section">
                        <h3 className="consultation-section-title">Design Preferences</h3>
                        <div className="consultation-form-grid">
                          <div className="consultation-form-group">
                            <label>
                              <Palette className="w-4 h-4" />
                              Design Style
                            </label>
                            <select
                              value={interiorData.designStyle}
                              onChange={(e) =>
                                handleInteriorChange("designStyle", e.target.value)
                              }
                            >
                              <option value="">Select design style</option>
                              {designStyles.map((style) => (
                                <option key={style} value={style}>
                                  {style}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <IndianRupee className="w-4 h-4" />
                              Budget Range *
                            </label>
                            <select
                              value={interiorData.budgetRange}
                              onChange={(e) =>
                                handleInteriorChange("budgetRange", e.target.value)
                              }
                              className={errors.budgetRange ? "error" : ""}
                            >
                              <option value="">Select budget range</option>
                              {budgetRanges.map((range) => (
                                <option key={range} value={range}>
                                  {range}
                                </option>
                              ))}
                            </select>
                            {errors.budgetRange && (
                              <span className="error-text">{errors.budgetRange}</span>
                            )}
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <Calendar className="w-4 h-4" />
                              Timeline
                            </label>
                            <select
                              value={interiorData.timeline}
                              onChange={(e) =>
                                handleInteriorChange("timeline", e.target.value)
                              }
                            >
                              <option value="">Select timeline</option>
                              {timelineOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="consultation-section">
                        <h3 className="consultation-section-title">Vastu Details</h3>
                        <div className="consultation-form-grid">
                          <div className="consultation-form-group">
                            <label>
                              <Home className="w-4 h-4" />
                              Property Type *
                            </label>
                            <select
                              value={vastuData.propertyType}
                              onChange={(e) =>
                                handleVastuChange("propertyType", e.target.value)
                              }
                              className={errors.propertyType ? "error" : ""}
                            >
                              <option value="">Select property type</option>
                              {vastuPropertyTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            {errors.propertyType && (
                              <span className="error-text">{errors.propertyType}</span>
                            )}
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <Compass className="w-4 h-4" />
                              Consultation Type *
                            </label>
                            <select
                              value={vastuData.consultationType}
                              onChange={(e) =>
                                handleVastuChange("consultationType", e.target.value)
                              }
                              className={errors.consultationType ? "error" : ""}
                            >
                              <option value="">Select type</option>
                              {vastuConsultationTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            {errors.consultationType && (
                              <span className="error-text">{errors.consultationType}</span>
                            )}
                          </div>

                          <div className="consultation-form-group">
                            <label>
                              <Calendar className="w-4 h-4" />
                              Preferred Date
                            </label>
                            <input
                              type="date"
                              value={vastuData.preferredDate}
                              onChange={(e) =>
                                handleVastuChange("preferredDate", e.target.value)
                              }
                            />
                          </div>

                          <div className="consultation-form-group full-width">
                            <label>
                              <Landmark className="w-4 h-4" />
                              Property Address/Location
                            </label>
                            <input
                              type="text"
                              value={vastuData.propertyAddress}
                              onChange={(e) =>
                                handleVastuChange("propertyAddress", e.target.value)
                              }
                              placeholder="e.g. Area, City"
                            />
                          </div>
                        </div>

                        <div className="consultation-form-group full-width">
                          <label>Areas of Concern/Interest</label>
                          <div className="consultation-chips">
                            {vastuIssues.map((issue) => (
                              <motion.button
                                key={issue}
                                type="button"
                                className={`consultation-chip ${
                                  vastuData.issues.includes(issue) ? "active" : ""
                                }`}
                                onClick={() => toggleVastuIssue(issue)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {issue}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Message */}
                  <div className="consultation-section">
                    <div className="consultation-form-group full-width">
                      <label>
                        <MessageSquare className="w-4 h-4" />
                        Additional Requirements (Optional)
                      </label>
                      <textarea
                        value={
                          serviceType === "home_loan"
                            ? homeLoanData.message
                            : serviceType === "interior_design"
                            ? interiorData.message
                            : vastuData.message
                        }
                        onChange={(e) =>
                          serviceType === "home_loan"
                            ? handleHomeLoanChange("message", e.target.value)
                            : serviceType === "interior_design"
                            ? handleInteriorChange("message", e.target.value)
                            : handleVastuChange("message", e.target.value)
                        }
                        placeholder="Tell us more about your requirements..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="consultation-submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Submitting...
                      </motion.span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Consultation Request
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
