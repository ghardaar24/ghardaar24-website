import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Your account | Ghardaar24",
  description:
    "Log in or create your Ghardaar24 account to explore verified properties in Pune",
};

// Shared by login, signup, forgot and reset password.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthShell
      eyebrow="Pune homes · Zero brokerage"
      line1="Where every door"
      line2="leads home."
      sub="One free account unlocks full property details, photos and prices, and lets you send inquiries straight to our team."
    >
      {children}
    </AuthShell>
  );
}
