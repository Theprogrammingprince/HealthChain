"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Bell, User, LogOut, LifeBuoy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PatientEmergencyTab } from "@/components/dashboard/PatientEmergencyTab";
import Link from "next/link";

export default function PatientEmergencyPage() {
    const router = useRouter();
    const { walletAddress, profileImage, disconnectWallet } = useAppStore();

    const handleLogout = () => {
        disconnectWallet();
        router.push("/");
    };

    const displayAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "Not Connected";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00BFFF]/30 pb-20">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/60 backdrop-blur-2xl">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/patient/dashboard')}>
                            <div className="w-10 h-10 bg-[#00BFFF]/20 rounded-xl flex items-center justify-center border border-[#00BFFF]/20 group-hover:bg-[#00BFFF]/30 transition-all">
                                <Activity className="w-6 h-6 text-[#00BFFF]" />
                            </div>
                            <div>
                                <span className="text-xl font-black tracking-tighter uppercase block leading-none">HealthChain</span>
                                <span className="text-[10px] font-bold text-[#00BFFF] uppercase tracking-[0.2em]">Emergency Access</span>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-8 ml-10">
                            <Link href="/patient/dashboard" className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                                Overview
                            </Link>
                            <Link href="/patient/dashboard/records" className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                                Records
                            </Link>
                            <Link href="/patient/dashboard/permissions" className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                                Permissions
                            </Link>
                            <Link href="/patient/dashboard/emergency" className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b-2 border-red-500 pb-1">
                                Emergency
                            </Link>
                            <Link href="/patient/dashboard/history" className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                                History
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <code className="text-[11px] text-gray-400 font-mono">{displayAddress}</code>
                        </div>

                        <Link href="/patient/dashboard/notifications" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                            <Bell className="w-4 h-4 text-gray-400" />
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer border-2 border-white/5 hover:border-[#00BFFF]/50 transition-all w-10 h-10">
                                    <AvatarImage src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`} />
                                    <AvatarFallback className="bg-white/5"><User /></AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white w-56 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="px-3 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    SECURE SESSION
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-xl p-3">
                                    <User className="w-4 h-4 mr-2" /> Private Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-xl p-3" onClick={() => router.push('/patient/dashboard/support')}>
                                    <LifeBuoy className="w-4 h-4 mr-2" /> Support Protocol
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="focus:bg-red-500/10 cursor-pointer rounded-xl p-3 text-red-500" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" /> Terminate Session
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-10 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    <motion.section variants={itemVariants}>
                        <PatientEmergencyTab />
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
}
