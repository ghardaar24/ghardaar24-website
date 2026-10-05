import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Property Brochures & Guides | Ghardaar24",
  description:
    "Download free brochures and buying guides for Pune properties from Ghardaar24.",
  alternates: { canonical: "https://ghardaar24.com/downloads" },
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
