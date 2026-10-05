import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Property in Pune | Zero Brokerage | Ghardaar24",
  description:
    "Sell or rent out your Pune property with Ghardaar24. Submit your listing for free; our team reviews it before it goes live.",
  alternates: { canonical: "https://ghardaar24.com/properties/submit" },
};

export default function SubmitPropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
