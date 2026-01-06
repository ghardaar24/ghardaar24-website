import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vastu Consultation Services Pune | Vastu Expert | Ghardaar24",
  description:
    "Expert Vastu Shastra consultation for homes and offices in Pune. Harmonize your living space with certified Vastu consultants. Free initial consultation available.",
  keywords: [
    "Vastu consultant Pune",
    "Vastu Shastra services",
    "home Vastu",
    "office Vastu",
    "Vastu remedies",
    "Vastu expert Pune",
    "residential Vastu",
    "commercial Vastu",
  ],
  openGraph: {
    title: "Vastu Consultation Services | Ghardaar24",
    description:
      "Expert Vastu Shastra consultation for homes and offices. Harmonize your space with ancient wisdom and modern solutions.",
    type: "website",
    url: "https://ghardaar24.com/services/vastu-consultation",
  },
  alternates: {
    canonical: "https://ghardaar24.com/services/vastu-consultation",
  },
};

export default function VastuConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
