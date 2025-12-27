import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interior Design Services | Transform Your Home | Ghardaar24",
  description:
    "Professional interior design services by Ghardaar24. Transform your new home with customized designs, modern aesthetics, and quality execution.",
};

export default function InteriorDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
