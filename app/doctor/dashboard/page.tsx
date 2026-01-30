"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    LogOut,
    Bell,
    Settings,
    User,
    FileText,
    TrendingUp,
    Users,
    ClipboardCheck,
    Loader2,
    Search,
    Filter,
    LifeBuoy,
    AlertCircle,
    ArrowRight
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
import { supabase } from "@/lib/supabaseClient";
import { getDoctorProfile, getDoctorStatistics, getRecentDoctorSubmissions } from "@/lib/database.service";
import { format } from "date-fns";

export default function DoctorDashboard() {
    const router = useRouter();
    const { disconnectWallet, supabaseSession } = useAppStore();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, [supabaseSession]);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const userId = supabaseSession?.user?.id;

            if (!userId) {
                // Not logged in or session loading
                return;
            }

            // 1. Fetch Profile
            const doctorProfile = await getDoctorProfile(userId);
            if (doctorProfile) {
                setProfile(doctorProfile);

                // 2. Fetch Stats & Submissions using doctor table ID
                const [statsData, submissionsData] = await Promise.all([
                    getDoctorStatistics(doctorProfile.id),
                    getRecentDoctorSubmissions(doctorProfile.id, 5)
                ]);

                setStats(statsData);
                setSubmissions(submissionsData);
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setIsLoading(false);
            setStatsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
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

    if (isLoading && !profile) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30 font-sans">
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
                            <span className="text-sm font-bold text-white">Dr. {profile?.last_name || 'Practitioner'}</span>
                            <Badge className={`${profile?.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} border-none text-[9px] uppercase font-black px-2 mt-0.5`}>
                                {profile?.verification_status === 'verified' ? 'Verified Practitioner' : 'Verification Pending'}
                            </Badge>
                        </div>

                        <button
                            onClick={() => router.push('/doctor/notifications')}
                            className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Bell className="w-4 h-4 text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0A0A0A]"></span>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer border-2 border-white/5 hover:border-emerald-500/50 transition-all w-10 h-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.last_name || 'Doctor'}`} />
                                    <AvatarFallback className="bg-white/5"><User /></AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white w-56 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="px-3 py-1 flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Digital MD Identity</span>
                                    <span className="font-bold text-sm truncate">{profile?.email}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    onClick={() => router.push('/doctor/settings')}
                                    className="focus:bg-white/5 cursor-pointer rounded-xl p-3"
                                >
                                    <Settings className="w-4 h-4 mr-2" /> Profile Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push('/support')}
                                    className="focus:bg-white/5 cursor-pointer rounded-xl p-3"
                                >
                                    <LifeBuoy className="w-4 h-4 mr-2" /> Protocol Support
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-red-500/10 cursor-pointer rounded-xl p-3 text-red-500" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" /> End Session
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
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Clinical Hub</h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                                {profile?.specialty} • {profile?.hospital_name || 'Independent Practice'}
                            </p>
                        </div>
                        <div className="flex gap-8">
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-white">{stats?.approval_rate || '0'}%</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Approval Precision</span>
                            </div>
                            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-emerald-400">{stats?.total_patient_count || '0'}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Patients</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Completion Banner */}
                    {profile && (!profile.phone || !profile.years_of_experience || profile.verification_status === 'pending') && (
                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Complete Your Profile</h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {profile.verification_status === 'pending'
                                                ? 'Your profile is under review. Complete all details to expedite verification.'
                                                : 'Add your phone number and experience to enable full verification.'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => router.push('/doctor/settings')}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 shrink-0"
                                >
                                    Complete Profile
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Submissions", value: stats?.total_submissions || "0", icon: ClipboardCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { label: "Pending Approval", value: stats?.avg_approval_time_hours || "0", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
                            { label: "Verified Records", value: stats?.verified_count || "0", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                            { label: "Avg Process Time", value: "< 1h", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-all cursor-default">
                                <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
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
                            <motion.section variants={itemVariants} className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 h-full backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Recent Submissions</h3>
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 px-3 rounded-lg">
                                        Monitor All
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout text-white">
                                        {submissions.length > 0 ? (
                                            submissions.map((sub, i) => (
                                                <motion.div
                                                    key={sub.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all group relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                                                {sub.record_type}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                                Patient: <span className="text-gray-400">{sub.patient_name || 'Anonymous'}</span>
                                                            </p>
                                                        </div>
                                                        <StatusBadge status={sub.overall_status} />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
                                                        <span>{format(new Date(sub.created_at), 'MMM dd, yyyy')}</span>
                                                        <span className="text-gray-700">TX: {sub.submission_code}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                                                <FileText className="mx-auto text-gray-800 mb-4" size={40} />
                                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No recent submissions found</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group cursor-default">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                                <Activity className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest mb-1">On-Chain Sync Status</p>
                                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                                    Infrastructure: <span className="text-emerald-500">OPTIMAL</span>. Cross-hospital record synchronization is currently processing at 0.4s latency.
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
