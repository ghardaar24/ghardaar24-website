"use client";

import { ReactNode } from "react";

interface ScrollToButtonProps {
  targetId: string;
  children: ReactNode;
  className?: string;
  block?: ScrollLogicalPosition;
}

export default function ScrollToButton({
  targetId,
  children,
  className,
  block = "start",
}: ScrollToButtonProps) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block,
    });
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
