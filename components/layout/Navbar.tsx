"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/features/WalletConnect";
import { Activity } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/emergency", label: "Emergency", className: "text-red-500 hover:text-red-400" },
    ];

    return (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <Activity className="h-6 w-6 text-primary animate-pulse" />
                    <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
                        HealthChain
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-6 text-sm font-medium">
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
                    <WalletConnect />
                </div>
            </div>
        </nav>
    );
}
