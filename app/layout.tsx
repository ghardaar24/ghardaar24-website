import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import {
  defaultMetadata,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { AuthProvider } from "@/lib/auth";
import { StaffAuthProvider } from "@/lib/staff-auth";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QEHYN9XRC7"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QEHYN9XRC7');
            `,
          }}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#f36a2a" />
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
        <AuthProvider>
          <StaffAuthProvider>
            {children}
            <FloatingWhatsApp />
          </StaffAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
