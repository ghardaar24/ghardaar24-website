import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Loan Assistance Pune | Best Rates & Quick Approval | Ghardaar24",
  description:
    "Get the best home loan rates with Ghardaar24. We partner with leading banks to help you secure financing for your dream home with quick approvals and minimal documentation.",
  keywords: [
    "home loan Pune",
    "housing loan assistance",
    "best home loan rates",
    "quick home loan approval",
    "home finance Pune",
    "property loan",
    "mortgage assistance",
  ],
  openGraph: {
    title: "Home Loan Assistance | Ghardaar24",
    description:
      "Get the best home loan rates with quick approvals and minimal documentation. Partner with leading banks.",
    type: "website",
    url: "https://ghardaar24.com/services/home-loans",
  },
  alternates: {
    canonical: "https://ghardaar24.com/services/home-loans",
  },
};

export default function HomeLoansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
