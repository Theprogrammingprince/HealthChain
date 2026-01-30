import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthChain | Your Patient Identity, Globalized",
  description: "The world's first secure, patient-owned emergency medical gateway. Access your records anywhere, instantly, with total privacy.",
  keywords: ["medical records", "health identity", "emergency medical data", "digital health", "private healthcare"],
  openGraph: {
    title: "HealthChain - Your Health, Your Identity",
    description: "Secure, patient-owned medical gateway for global emergency access.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthChain",
    description: "Instant access to your medical history in emergencies, anywhere in the world.",
  }
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
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
