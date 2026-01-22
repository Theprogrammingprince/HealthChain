"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    HeartPulse,
    Activity,
    Droplet,
    Scale,
    Clock,
    TrendingUp,
    FlaskConical,
    ShieldCheck,
    Lock,
    ChevronRight,
    Plus,
    ArrowRight,
    LogOut,
    Bell,
    Settings,
    LayoutDashboard,
    FileText,
    User,
    History,
    ShieldAlert,
    Dna
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { HealthSummaryCard } from "@/components/dashboard/HealthSummaryCard";
import { DocumentUploadDialog } from "@/components/dashboard/DocumentUploadDialog";
import { AccessControlList } from "@/components/dashboard/AccessControlList";
import { ActivityLogTable } from "@/components/dashboard/ActivityLogTable";
import { RecordCard } from "@/components/dashboard/RecordCard";
import { PassportPhotoUpload } from "@/components/dashboard/PassportPhotoUpload";
import { ProfileSetupDialog } from "@/components/dashboard/ProfileSetupDialog";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { RequireAuth } from "@/components/features/RequireAuth";

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const router = useRouter();
    const {
        walletAddress,
        records,
        userVitals,
        disconnectWallet,
        fetchUserProfile,
        supabaseUser
    } = useAppStore();
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const initData = async () => {
            await fetchUserProfile();
            setIsLoading(false);
        };
        initData();
    }, [fetchUserProfile]);

    useEffect(() => {
        // Check if profile setup is needed
        if (!isLoading && supabaseUser && (!userVitals.fullName || !userVitals.dob)) {
            setShowProfileSetup(true);
        }
    }, [isLoading, supabaseUser, userVitals.fullName, userVitals.dob]);

    const handleLogout = () => {
        disconnectWallet();
        router.push("/");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Truncate address for UI
    const displayAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "NOT_CONNECTED";

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00BFFF]/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden sm:block hidden">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#00BFFF]/5 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[160px]" />
            </div>

            {/* Vault Sticky Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/60 backdrop-blur-2xl">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
                            <div className="w-10 h-10 bg-[#00BFFF]/20 rounded-xl flex items-center justify-center border border-[#00BFFF]/20 group-hover:bg-[#00BFFF]/30 transition-all">
                                <ShieldCheck className="w-6 h-6 text-[#00BFFF]" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-xl font-black tracking-tighter uppercase block leading-none">HealthChain</span>
                                <span className="text-[10px] font-bold text-[#00BFFF] uppercase tracking-[0.2em]">Vault v2.5</span>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-8 ml-10">
                            <button className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b-2 border-[#00BFFF] pb-1">
                                Overview
                            </button>
                            <button className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                                Records
                            </button>
                            <button className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">
                                Permissions
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <code className="text-[11px] text-gray-400 font-mono">{displayAddress}</code>
                        </div>

                        <Link href="/dashboard/notifications" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                            <Bell className="w-4 h-4 text-gray-400" />
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer border-2 border-white/5 hover:border-[#00BFFF]/50 transition-all w-10 h-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`} />
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
                                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-xl p-3">
                                    <Settings className="w-4 h-4 mr-2" /> Vault Settings
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

            <main className="max-w-[1400px] mx-auto px-6 py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    {/* Hero: Health Summary */}
                    <motion.section variants={itemVariants}>
                        {isLoading ? (
                            <Skeleton className="w-full h-[320px] rounded-3xl bg-white/5" />
                        ) : (
                            <HealthSummaryCard onEdit={() => setShowProfileSetup(true)} />
                        )}
                    </motion.section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Left Content (8 cols) */}
                        <div className="lg:col-span-8 space-y-12">

                            {/* Document Manager */}
                            <motion.section variants={itemVariants} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <FileText className="text-[#00BFFF] w-6 h-6" />
                                            Medical Documents
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">SECURELY STORED ON DECENTRALIZED IPFS CHANNELS</p>
                                    </div>
                                    <DocumentUploadDialog />
                                </div>

                                <Tabs defaultValue="Laboratory" className="w-full">
                                    <TabsList className="bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
                                        {['Laboratory', 'Radiology', 'Pharmacy', 'General'].map(cat => (
                                            <TabsTrigger
                                                key={cat}
                                                value={cat}
                                                className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black rounded-lg transition-all font-bold px-6"
                                            >
                                                {cat}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {['Laboratory', 'Radiology', 'Pharmacy', 'General'].map(cat => (
                                        <TabsContent key={cat} value={cat} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {records.filter(r => r.category === cat).map(record => (
                                                    <RecordCard key={record.id} record={record} />
                                                ))}
                                            </div>
                                            {records.filter(r => r.category === cat).length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-20 bg-white/2 border border-dashed border-white/10 rounded-3xl">
                                                    <Plus className="w-12 h-12 text-gray-700 mb-4" />
                                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No {cat} Records Still</p>
                                                    <p className="text-gray-600 text-xs mt-2 italic">Upload documents to verify your on-chain history</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </motion.section>

                            {/* Activity Log */}
                            <motion.section variants={itemVariants}>
                                <ActivityLogTable />
                            </motion.section>

                        </div>

                        {/* Right Sidebar (4 cols) */}
                        <div className="lg:col-span-4 space-y-12">

                            {/* Verified Identity */}
                            <motion.section variants={itemVariants} className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <ShieldCheck size={100} />
                                </div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF]">
                                        <User size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg">Verified Identity</h3>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <PassportPhotoUpload />
                                </div>

                                <div className="text-center space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-[0.2em]">
                                            {userVitals.fullName || "IDENTIFYING..."}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <code className="text-[9px] text-gray-500 font-mono break-all">
                                                {walletAddress ? `${walletAddress.slice(0, 12)}...${walletAddress.slice(-8)}` : "0x..."}
                                            </code>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] text-gray-500 block mb-1 uppercase font-black">Genotype</span>
                                            <span className="text-sm font-bold text-primary">{userVitals.genotype}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] text-gray-500 block mb-1 uppercase font-black">Blood Group</span>
                                            <span className="text-sm font-bold text-red-400">{userVitals.bloodType}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] text-gray-500 block mb-1 uppercase font-black">Weight</span>
                                            <span className="text-sm font-bold text-white">{userVitals.weight} <span className="text-[10px] text-gray-500">kg</span></span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-left">
                                            <span className="text-[10px] text-gray-500 block mb-1 uppercase font-black">Height</span>
                                            <span className="text-sm font-bold text-white">{userVitals.height} <span className="text-[10px] text-gray-500">cm</span></span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between px-4 py-3 bg-white/2 rounded-2xl border border-white/5">
                                            <span className="text-[10px] text-gray-500 uppercase font-black">Age</span>
                                            <span className="text-xs font-bold text-white">
                                                {userVitals.dob ? `${Math.floor((new Date().getTime() - new Date(userVitals.dob).getTime()) / 31557600000)} Yrs` : "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 bg-white/2 rounded-2xl border border-white/5">
                                            <span className="text-[10px] text-gray-500 uppercase font-black">Religion</span>
                                            <span className="text-xs font-bold text-white">{userVitals.religion || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-[#10B981] bg-[#10B981]/10 py-3 rounded-2xl border border-[#10B981]/20 mt-4">
                                        <ShieldCheck size={14} className="animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Access Control Quick Actions */}
                            <motion.section variants={itemVariants}>
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <Lock size={20} />
                                        </div>
                                        <h3 className="font-bold text-lg">Access Governance</h3>
                                    </div>

                                    <AccessControlList />

                                    <div className="pt-8 border-t border-white/5">
                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-4 group cursor-pointer hover:bg-red-500/10 transition-colors">
                                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                                <ShieldAlert size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-white uppercase">Emergency Mode</p>
                                                <p className="text-[10px] text-gray-500">Enable one-time rescue access</p>
                                            </div>
                                            <ArrowRight size={14} className="text-gray-700 group-hover:text-white" />
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Privacy Tip Card */}
                            <motion.section variants={itemVariants} className="bg-gradient-to-br from-[#00BFFF]/10 to-transparent border border-[#00BFFF]/20 rounded-3xl p-8 text-center space-y-4">
                                <Lock className="w-10 h-10 text-[#00BFFF] mx-auto mb-2 opacity-60" />
                                <h4 className="font-bold text-white uppercase tracking-wider text-sm">Self-Sovereign Data</h4>
                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                    Your medical records are encrypted with AES-256 before being fragmented and stored on IPFS. Only your private keys can reconstruct the clinical data.
                                </p>
                                <div className="flex items-center justify-center gap-3 pt-4">
                                    <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Encrypted Tunnel Active</span>
                                </div>
                            </motion.section>

                        </div>

                    </div>
                </motion.div>
                <ProfileSetupDialog isOpen={showProfileSetup} onClose={() => setShowProfileSetup(false)} />
            </main>

            <footer className="border-t border-white/5 py-12 mt-20">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">HealthChain Resilience Network</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-7(00 uppercase tracking-widest">
                        Protocol Node: 0x92...AF10 • Latency: 42ms • Block: 68,291,203
                    </p>
                    <div className="flex items-center gap-6">
                        <button className="text-[10px] font-bold text-gray-600 hover:text-[#00BFFF] uppercase tracking-widest transition-colors">Privacy Policy</button>
                        <button className="text-[10px] font-bold text-gray-600 hover:text-[#00BFFF] uppercase tracking-widest transition-colors">Governance</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
