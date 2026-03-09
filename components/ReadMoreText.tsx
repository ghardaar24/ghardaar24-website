"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReadMoreTextProps {
  text: string;
  maxLength?: number;
}

export default function ReadMoreText({ text, maxLength = 250 }: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  
  const displayText = shouldTruncate && !isExpanded 
    ? `${text.slice(0, maxLength)}...` 
    : text;

  return (
    <div className="read-more-container">
      <p className="property-description">{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-primary font-medium mt-2 hover:underline focus:outline-none"
        >
          {isExpanded ? (
            <>
              Read Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
