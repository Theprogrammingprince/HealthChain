"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HeartPulse,
    Settings,
    LogOut,
    Activity,
    Droplet,
    Dna,
    Thermometer,
    Scale,
    Clock,
    LayoutDashboard,
    History,
    TrendingUp,
    FlaskConical,
    ShieldCheck,
    ChevronRight,
    User,
    ExternalLink,
    Lock
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { VitalsCard } from "@/components/dashboard/VitalsCard";
import { RecordCard } from "@/components/dashboard/RecordCard";
import { AddLabResultForm } from "@/components/dashboard/AddLabResultForm";
import { EmergencyQRDialog } from "@/components/dashboard/EmergencyQRDialog";
import { PassportPhotoUpload } from "@/components/dashboard/PassportPhotoUpload";
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

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { walletAddress, userVitals, records, disconnectWallet } = useAppStore();

    useEffect(() => {
        // Simulate initial loading
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        disconnectWallet();
        router.push("/");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Truncate address for UI
    const displayAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "Not Connected";

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden sm:block hidden">
                <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-white/5">
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-sans tracking-tight">HealthChain</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Network Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs text-gray-400 font-medium">{displayAddress}</span>
                            <span className="text-[9px] text-indigo-400/80 bg-indigo-400/5 px-2 py-0.5 rounded-full border border-indigo-400/10 mt-1">
                                Verified Patient ID
                            </span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer border border-white/10 hover:border-indigo-500/50 transition-colors w-10 h-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`} />
                                    <AvatarFallback className="bg-white/5 text-gray-400"><User /></AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white w-56 p-2">
                                <DropdownMenuLabel className="px-3 py-2">Account Control</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-lg p-2">
                                    <User className="w-4 h-4 mr-2" /> Profile Overview
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-lg p-2 text-red-500" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" /> Disconnect Securely
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    {/* Vitals Hero Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="text-indigo-400 w-6 h-6" /> Patient Overview
                            </h2>
                            <p className="text-gray-500 text-sm italic">Last updated: Today, 09:42 AM</p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <VitalsCard
                                    label="Blood Type"
                                    value={userVitals.bloodType}
                                    icon={Droplet}
                                    color="text-red-500"
                                />
                                <VitalsCard
                                    label="Genotype"
                                    value={userVitals.genotype}
                                    icon={Dna}
                                    color="text-purple-400"
                                />
                                <VitalsCard
                                    label="Blood Pressure"
                                    value={userVitals.bloodPressure}
                                    icon={HeartPulse}
                                    unit="mmHg"
                                    color="text-emerald-500"
                                    pulse
                                />
                                <VitalsCard
                                    label="Average Glucose"
                                    value={userVitals.glucose}
                                    icon={TrendingUp}
                                    color="text-indigo-500"
                                />
                                <VitalsCard
                                    label="Body Mass Index"
                                    value={userVitals.bmi.toString()}
                                    icon={Scale}
                                    unit="BMI"
                                    color="text-orange-500"
                                />
                            </div>
                        )}
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: Records & Form */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Records Section */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <History className="text-indigo-400 w-6 h-6" /> Clinical Records
                                    </h2>
                                </div>

                                <Tabs defaultValue="all" className="w-full">
                                    <TabsList className="bg-white/5 border border-white/5 p-1 mb-6 rounded-xl">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg px-6">All Records</TabsTrigger>
                                        <TabsTrigger value="Lab" className="rounded-lg px-6">Labs</TabsTrigger>
                                        <TabsTrigger value="Scan" className="rounded-lg px-6">Imaging</TabsTrigger>
                                        <TabsTrigger value="Prescription" className="rounded-lg px-6">Script</TabsTrigger>
                                    </TabsList>

                                    {["all", "Lab", "Scan", "Prescription"].map(tabType => (
                                        <TabsContent key={tabType} value={tabType} className="mt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {records
                                                    .filter(r => tabType === "all" || r.type === tabType)
                                                    .map(record => (
                                                        <RecordCard key={record.id} record={record} />
                                                    ))}
                                            </div>
                                            {records.filter(r => tabType === "all" || r.type === tabType).length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                                    <FlaskConical className="w-12 h-12 text-gray-600 mb-4" />
                                                    <p className="text-gray-500 font-medium">No records found for this category</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </section>

                            {/* Add Record Form */}
                            <section>
                                <AddLabResultForm />
                            </section>
                        </div>

                        {/* Right Column: Emergency & Sidebar */}
                        <div className="space-y-8">
                            {/* Profile Passport Section */}
                            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                        <User size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg text-white">Verified Identity</h3>
                                </div>

                                <div className="flex justify-center mb-6">
                                    <PassportPhotoUpload />
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-white uppercase tracking-wider">Patient ID Card</p>
                                    <p className="text-[10px] text-gray-500 font-mono tracking-tighter">HASH: {walletAddress?.slice(0, 20)}...</p>
                                </div>
                            </section>

                            {/* Emergency Section */}
                            <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 ring-1 ring-red-500/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-red-500/20 text-red-500">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg text-white">Emergency Protocol</h3>
                                </div>

                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                    In case of an emergency, first responders can access your
                                    <span className="text-white font-medium"> critical vitals</span> by scanning your unique ID.
                                </p>

                                <EmergencyQRDialog />

                                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                                        Powered by Zero-Knowledge Proofs
                                    </p>
                                </div>
                            </section>

                            {/* Quick Insights */}
                            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl" />
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-indigo-400 w-5 h-5" /> Health Trends
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <User size={16} />
                                            </div>
                                            <span className="text-sm font-medium">Full Profile</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Clock size={16} />
                                            </div>
                                            <span className="text-sm font-medium">Audit Trail</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </section>

                            {/* Security Badge */}
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Lock className="text-emerald-500 w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Self-Sovereign Data</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed">
                                    All medical records are encrypted with your private keys on the Polygon network.
                                    Only you (and those you authorize) can decrypt this data.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="border-t border-white/5 py-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-600">
                        © 2025 HealthChain Protocol. Proprietary and confidential.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-gray-500 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Encrypted by AES-256
                        </span>
                        <span className="text-xs text-indigo-400/60 flex items-center gap-2 hover:text-indigo-400 cursor-pointer">
                            Polygon Explorer <ExternalLink className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
