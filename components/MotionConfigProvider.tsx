"use client";

import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";

// Respects the OS "reduce motion" setting for every framer-motion animation
// in the tree (CSS already handles it separately in globals.css).
export default function MotionConfigProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
