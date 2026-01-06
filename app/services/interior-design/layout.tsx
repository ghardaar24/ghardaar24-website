import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interior Design Services Pune | Home Interiors | Ghardaar24",
  description:
    "Transform your home with expert interior design services. Modern, contemporary, traditional designs with end-to-end project management. Free consultation in Pune.",
  keywords: [
    "interior design Pune",
    "home interior services",
    "modular kitchen Pune",
    "living room design",
    "bedroom interiors",
    "interior decorator Pune",
    "home renovation",
  ],
  openGraph: {
    title: "Interior Design Services | Ghardaar24",
    description:
      "Expert interior design services with free consultation. Transform your space with our professional designers.",
    type: "website",
    url: "https://ghardaar24.com/services/interior-design",
  },
  alternates: {
    canonical: "https://ghardaar24.com/services/interior-design",
  },
};

export default function InteriorDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
