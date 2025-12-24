import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { defaultMetadata, generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";
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
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },
      { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
    ],
  },
  manifest: "/site.webmanifest",
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
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Pune" />
        <link rel="canonical" href="https://ghardaar24.com" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}

