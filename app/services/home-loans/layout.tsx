import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Loan Assistance | Best Rates & Quick Approval | Ghardaar24",
  description:
    "Get the best home loan rates with Ghardaar24. We partner with leading banks to help you secure financing for your dream home with quick approvals and minimal documentation.",
};

export default function HomeLoansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
