import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#10b981" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
