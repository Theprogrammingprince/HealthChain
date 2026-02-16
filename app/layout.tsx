import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  WebApplicationJsonLd,
  MedicalOrganizationJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://healthchain.io';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "HealthChain | Secure Health Records & Patient Identity Platform",
    template: "%s | HealthChain",
  },
  description: "HealthChain is the world's first secure, patient-owned health records platform. Access your medical data anywhere with blockchain-powered privacy. Emergency medical gateway for hospitals, doctors, and patients.",
  keywords: [
    "health", "healthchain", "health chain", "health records", "medical records",
    "patient identity", "digital health", "health platform", "healthcare technology",
    "emergency medical data", "secure health data", "blockchain health",
    "electronic health records", "EHR", "patient portal", "health management",
    "medical history", "health information exchange", "telemedicine platform",
    "HIPAA compliant", "patient privacy", "health data security",
    "hospital management", "doctor portal", "clinical dashboard",
  ],
  authors: [{ name: "HealthChain", url: baseUrl }],
  creator: "HealthChain",
  publisher: "HealthChain",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "HealthChain — Your Health, Your Identity, Globally Accessible",
    description: "Secure, patient-owned medical gateway. Access health records globally with blockchain-powered encryption. Built for patients, doctors, and hospitals.",
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "HealthChain",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthChain | Secure Health Records Platform",
    description: "Access your medical history anywhere, instantly, with total privacy. The future of health data management.",
    creator: "@healthchain",
  },
  alternates: {
    canonical: baseUrl,
  },
  category: "Health & Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased bg-background text-foreground min-h-screen flex flex-col ${inter.variable} font-sans`}
        suppressHydrationWarning
      >
        <Providers>
          <OrganizationJsonLd />
          <WebSiteJsonLd />
          <WebApplicationJsonLd />
          <MedicalOrganizationJsonLd />
          <SoftwareApplicationJsonLd />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
