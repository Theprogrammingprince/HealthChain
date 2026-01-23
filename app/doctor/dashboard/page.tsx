"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    LogOut,
    Bell,
    Settings,
    User,
    FileText,
    TrendingUp,
    Users,
    ClipboardCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { DoctorRecordUploadForm } from "@/components/dashboard/DoctorRecordUploadForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data for submissions
const mockSubmissions = [
    { id: 1, patient: "Alice M. (p_1023)", type: "Lab Result", date: "2024-03-10", status: "Pending Hospital Review" },
    { id: 2, patient: "Kenzy S. (p_8291)", type: "Prescription", date: "2024-03-09", status: "Pending Patient Approval" },
    { id: 3, patient: "John D. (p_4421)", type: "Imaging", date: "2024-03-08", status: "Approved" },
    { id: 4, patient: "Sarah L. (p_9912)", type: "Clinical Note", date: "2024-03-05", status: "Rejected" },
];

export default function DoctorDashboard() {
    const router = useRouter();
    const { disconnectWallet, isAuthenticated } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

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

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/60 backdrop-blur-2xl">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
                                <Activity className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <span className="text-xl font-black tracking-tighter uppercase block leading-none">HealthChain</span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Professional Portal</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-white">Dr. Sarah Jenkins</span>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase font-black px-2 mt-0.5">
                                Verified Practitioner
                            </Badge>
                        </div>

                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                            <Bell className="w-4 h-4 text-gray-400" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer border-2 border-white/5 hover:border-emerald-500/50 transition-all w-10 h-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} />
                                    <AvatarFallback className="bg-white/5"><User /></AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white w-56 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="px-3 py-1 flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Professional Account</span>
                                    <span className="font-bold text-sm">Authenticated</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="focus:bg-white/5 cursor-pointer rounded-xl p-3">
                                    <Settings className="w-4 h-4 mr-2" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-red-500/10 cursor-pointer rounded-xl p-3 text-red-500" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-10 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    {/* Welcome Section */}
                    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Overview</h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Manage Your Clinical Submissions</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-white">98%</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Approval Rate</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Patients", value: "1,204", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { label: "Draft Records", value: "12", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
                            { label: "Pending Review", value: "5", icon: ClipboardCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
                            { label: "This Week", value: "+24", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Upload Form */}
                        <div className="lg:col-span-7">
                            <motion.section variants={itemVariants}>
                                <DoctorRecordUploadForm />
                            </motion.section>
                        </div>

                        {/* Right Column: Recent Activity / Status */}
                        <div className="lg:col-span-5 space-y-8">
                            <motion.section variants={itemVariants} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white">Recent Submissions</h3>
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 px-3 rounded-lg">
                                        View All
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {mockSubmissions.map((sub, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">{sub.type}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{sub.patient}</p>
                                                </div>
                                                <StatusBadge status={sub.status} />
                                            </div>
                                            <div className="flex items-center justify-between mt-4 text-[10px] font-medium text-gray-600">
                                                <span>{sub.date}</span>
                                                <span className="uppercase tracking-widest">ID: #{sub.id}0029</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Activity className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase">System Notice</p>
                                                <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                                                    Hospital Admin "City General" is currently experiencing high volume. Record reviews may be delayed by up to 2 hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
