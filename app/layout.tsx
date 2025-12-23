import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthDialog } from "@/components/features/AuthDialog";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthChain - Decentralized Medical Records",
  description: "Secure, patient-owned, emergency-ready medical data on Polygon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <AuthDialog />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
