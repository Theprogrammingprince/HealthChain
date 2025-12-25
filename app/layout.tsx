import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthDialog } from "@/components/features/AuthDialog";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthChain - Decentralized Medical Records",
  description: "Secure, patient-owned, emergency-ready medical data on Polygon. Grant instant access to first responders worldwide.",
  keywords: ["blockchain health", "medical records", "polygon", "decentralized", "emergency medical data", "web3 healthcare"],
  openGraph: {
    title: "HealthChain - Own Your Health Data",
    description: "Secure, patient-owned medical records on Polygon.",
    type: "website",
    locale: "en_US",
    // images: ['/og-image.png'], // Placeholder for future OG image
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthChain",
    description: "Decentralized medical records for global emergencies.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <AuthDialog />
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
