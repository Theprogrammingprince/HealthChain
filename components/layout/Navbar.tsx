"use client";

import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/features/AuthButton";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated } = useAppStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    // Listen for scroll to toggle navbar background
    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const links = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },
        { href: "/emergency", label: "Emergency", highlight: "red" },
        { href: "/support", label: "Support", highlight: "emerald" },
    ];

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
                    hasScrolled
                        ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_40px_rgba(30,64,175,0.04)] border-b border-slate-200/60"
                        : "bg-transparent border-b border-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[72px] items-center justify-between">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-9 h-9 transition-all duration-300 group-hover:scale-110">
                                <Image
                                    src="/logo.svg"
                                    alt="HealthChain Logo"
                                    width={36}
                                    height={36}
                                    className="w-9 h-9"
                                    priority
                                />
                                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <span className={cn(
                                "text-lg font-bold tracking-tight transition-colors duration-300",
                                hasScrolled ? "text-slate-900" : "text-slate-900"
                            )}>
                                Health<span className="text-primary">Chain</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300",
                                            isActive
                                                ? "text-primary"
                                                : link.highlight === "red"
                                                    ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    : link.highlight === "emerald"
                                                        ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                                        )}
                                    >
                                        {link.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-active-indicator"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-primary"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Auth */}
                        <div className="hidden lg:flex items-center gap-3">
                            <AuthButton />
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex items-center gap-3 lg:hidden">
                            <AuthButton />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={cn(
                                    "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300",
                                    isMobileMenuOpen
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-700 hover:bg-slate-100"
                                )}
                                aria-label="Toggle menu"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isMobileMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Menu className="h-5 w-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="fixed top-[72px] left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-xl shadow-slate-200/20"
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    {links.map((link, index) => {
                                        const isActive = pathname === link.href;
                                        return (
                                            <motion.div
                                                key={link.href}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={cn(
                                                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                                        isActive
                                                            ? "text-primary bg-primary/5"
                                                            : link.highlight === "red"
                                                                ? "text-red-500 hover:bg-red-50"
                                                                : link.highlight === "emerald"
                                                                    ? "text-emerald-600 hover:bg-emerald-50"
                                                                    : "text-slate-700 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <span>{link.label}</span>
                                                    {isActive && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    )}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Mobile CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                    className="mt-4 pt-4 border-t border-slate-100"
                                >
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full rounded-xl h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group">
                                            Get Started Free
                                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
