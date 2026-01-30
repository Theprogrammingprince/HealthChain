"use client";

import Link from "next/link";
import { AuthButton } from "@/components/features/AuthButton";
import { Activity, Menu, X, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationCenter } from "@/components/features/NotificationCenter";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated } = useAppStore();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { href: "/", label: "Network" },
        { href: "/about", label: "About" },
        { href: "/partners", label: "Partners" },
        { href: "/documentation", label: "Docs" },
        { href: "/faq", label: "FAQ" },
    ];

    // Protected dashboard links (only show when authenticated)
    const protectedLinks = [
        { href: "/patient/dashboard", label: "Dashboard", color: "text-blue-400" },
        { href: "/clinical/dashboard", label: "Hospital", color: "text-indigo-400" },
        { href: "/doctor", label: "Professional", color: "text-emerald-400" },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
            scrolled
                ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3"
                : "bg-transparent py-6"
        )}>
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group relative">
                    <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Activity className={cn(
                        "h-6 w-6 text-blue-500 transition-transform group-hover:rotate-12",
                        isAuthenticated ? "animate-pulse" : ""
                    )} />
                    <span className="text-xl font-black tracking-tighter uppercase italic text-white relative">
                        HealthChain
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-12">
                    <div className="flex items-center gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-blue-400",
                                    pathname === link.href ? "text-blue-500" : "text-gray-400"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated && (
                            <div className="h-4 w-px bg-white/10 mx-2" />
                        )}

                        {isAuthenticated && protectedLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                    pathname?.startsWith(link.href) ? "text-white" : cn("opacity-60 hover:opacity-100", link.color)
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated && <NotificationCenter />}
                        <AuthButton />
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    {isAuthenticated && <NotificationCenter />}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 p-8 lg:hidden shadow-3xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex flex-col gap-8">
                            <div className="space-y-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Navigation</p>
                                <div className="grid grid-cols-1 gap-4">
                                    {links.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "text-xl font-bold transition-all",
                                                pathname === link.href ? "text-blue-500" : "text-gray-400"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {isAuthenticated && (
                                <div className="space-y-6">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Dashboards</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {protectedLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={cn(
                                                    "text-xl font-bold flex items-center justify-between group",
                                                    link.color
                                                )}
                                            >
                                                {link.label}
                                                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-white/5">
                                <AuthButton />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
