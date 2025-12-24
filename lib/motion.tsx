"use client";

import { motion, Variants, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

// ============================================
// ANIMATION VARIANTS
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.98 },
};

export const imageHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const navLinkHover = {
  rest: { opacity: 0.7 },
  hover: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

// ============================================
// REUSABLE MOTION COMPONENTS
// ============================================

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MotionDiv({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      className={className}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionSection({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
      className={className}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

interface StaggerWrapperProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}

export function StaggerContainer({
  children,
  className,
  fast = false,
}: StaggerWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fast ? staggerContainerFast : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATION UTILITIES
// ============================================

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

// Text reveal animation
export const textReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// Mobile menu
export const menuSlide: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// Card tilt effect (for use with onMouseMove)
export function calculateTilt(
  e: React.MouseEvent<HTMLElement>,
  strength: number = 10
) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -strength;
  const rotateY = ((x - centerX) / centerX) * strength;
  return { rotateX, rotateY };
}

export { motion, AnimatePresence } from "framer-motion";
