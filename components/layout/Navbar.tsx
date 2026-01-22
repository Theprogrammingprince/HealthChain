"use client";

import Link from "next/link";
import { AuthButton } from "@/components/features/AuthButton";
import { Activity, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { motion } from "framer-motion";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated } = useAppStore();

    const links = [
        { href: "/", label: "Network" },
        { href: "/patient/dashboard", label: "Dashboard" },
        { href: "/clinical/dashboard", label: "Hospital", className: "text-indigo-400 hover:text-indigo-300" },
        { href: "/admin/dashboard", label: "Admin", className: "text-blue-400 hover:text-blue-300" },
        { href: "/emergency", label: "Emergency", className: "text-red-500 hover:text-red-400" },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <Activity className={cn(
                        "h-6 w-6 text-primary animate-pulse",
                        isAuthenticated ? "duration-[600ms]" : "duration-[2000ms]"
                    )} />
                    <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
                        HealthChain
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex gap-6 text-sm font-medium">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "transition-colors hover:text-primary",
                                    pathname === link.href ? "text-primary" : "text-muted-foreground",
                                    link.className
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <AuthButton />
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <AuthButton />
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl"
                >
                    <div className="flex flex-col p-4 space-y-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/5",
                                    pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground",
                                    link.className
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}

                    </div>
                </motion.div>
            )}
        </nav>
    );
}
