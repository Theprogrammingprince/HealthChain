"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    ShieldCheck,
    Globe2,
    Settings,
    Activity,
    Users,
    ChevronRight,
    Search,
    Bell,
    Clock
} from "lucide-react";
import Link from "next/link";
import { HospitalVerificationTable } from "@/components/admin/HospitalVerificationTable";
import { PaymasterMonitor } from "@/components/admin/PaymasterMonitor";
import { ComplianceTerminal } from "@/components/admin/ComplianceTerminal";
import AuditLogs from "@/components/admin/AuditLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

import { RequireAuth } from "@/components/features/RequireAuth";

interface Stats {
    totalHospitals: number;
    pendingVerifications: number;
    verifiedHospitals: number;
    totalPatients: number;
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("verification");
    const [hospitalFilter, setHospitalFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
    const [stats, setStats] = useState<Stats>({
        totalHospitals: 0,
        pendingVerifications: 0,
        verifiedHospitals: 0,
        totalPatients: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Fetch real stats from database
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch hospital counts
                const { data: hospitals, error: hospError } = await supabase
                    .from("hospital_profiles")
                    .select("verification_status");

                if (!hospError && hospitals) {
                    const pending = hospitals.filter(h => h.verification_status === "pending").length;
                    const verified = hospitals.filter(h => h.verification_status === "verified").length;

                    setStats(prev => ({
                        ...prev,
                        totalHospitals: hospitals.length,
                        pendingVerifications: pending,
                        verifiedHospitals: verified,
                    }));
                }

                // Fetch patient count
                const { count: patientCount, error: patientError } = await supabase
                    .from("patient_profiles")
                    .select("*", { count: "exact", head: true });

                if (!patientError && patientCount !== null) {
                    setStats(prev => ({
                        ...prev,
                        totalPatients: patientCount,
                    }));
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();

        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <RequireAuth requiredRole="Admin">
            <div className="min-h-screen bg-[#050505] pb-20 font-sans text-white">
                {/* Admin Header */}
                <header className="bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-50">
                    <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-600/30">
                                <Shield className="text-blue-500" size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white uppercase tracking-tighter leading-none">
                                    HealthChain <span className="text-blue-500">Registry</span>
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Governance Node</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <Globe2 size={12} className="text-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mainnet Alpha</span>
                            </div>

                            <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                                <Link href="/admin/dashboard/notifications" className="p-2 text-gray-400 hover:text-white transition-colors relative hover:bg-white/5 rounded-full">
                                    <Bell size={18} />
                                    {stats.pendingVerifications > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                                            {stats.pendingVerifications}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/admin/settings" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <Settings size={18} className="text-gray-400 hover:text-white" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
                    {/* Dashboard Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-transparent to-transparent border border-white/5 p-8"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">System Oversight</h1>
                                <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                                    Managing the authoritative ledger of healthcare providers and secure network operations.
                                    Ensuring transparency and compliance across the HealthChain ecosystem.
                                </p>
                            </div>
                            <div className="bg-[#10B981]/10 text-[#10B981] px-4 py-2 rounded-xl text-xs font-bold border border-[#10B981]/20 flex items-center gap-3">
                                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                                NETWORK HEALTH: 100.0% OPERATIONAL
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
                    </motion.div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Users}
                            label="Total Hospitals"
                            value={statsLoading ? "..." : stats.totalHospitals.toString()}
                            subtext={`${stats.verifiedHospitals} Verified`}
                            onClick={() => { setHospitalFilter("all"); setActiveTab("verification"); }}
                        />
                        <StatCard
                            icon={Clock}
                            label="Pending Review"
                            value={statsLoading ? "..." : stats.pendingVerifications.toString()}
                            subtext="Awaiting Approval"
                            highlight={stats.pendingVerifications > 0}
                            onClick={() => { setHospitalFilter("pending"); setActiveTab("verification"); }}
                        />
                        <StatCard
                            icon={ShieldCheck}
                            label="Verified Providers"
                            value={statsLoading ? "..." : stats.verifiedHospitals.toString()}
                            subtext="Active on Network"
                            onClick={() => { setHospitalFilter("verified"); setActiveTab("verification"); }}
                        />
                        <StatCard
                            icon={Activity}
                            label="Registered Patients"
                            value={statsLoading ? "..." : stats.totalPatients.toString()}
                            subtext="User Profiles"
                        />
                    </div>

                    {/* Main Content Tabs */}
                    <div className="space-y-6">
                        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                            <div className="flex items-center justify-between mb-2">
                                <TabsList className="bg-[#0A0A0A] border border-white/5 p-1 h-12 rounded-xl">
                                    <TabsTrigger
                                        value="verification"
                                        className="px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-wider"
                                    >
                                        Registry Queue
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="status"
                                        className="px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-wider"
                                    >
                                        Network Health
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="logs"
                                        className="px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-wider"
                                    >
                                        Security Audit
                                    </TabsTrigger>
                                </TabsList>

                                <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <Search size={14} className="text-gray-600" />
                                    Updated in Real-Time
                                </div>
                            </div>

                            <div className="mt-4 min-h-[500px]">
                                <TabsContent value="verification" className="space-y-4 outline-none border-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <HospitalVerificationTable initialFilter={hospitalFilter} />
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="status" className="space-y-8 outline-none border-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                                    >
                                        <PaymasterMonitor />
                                        <ComplianceTerminal />
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="logs" className="space-y-4 outline-none border-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <AuditLogs />
                                    </motion.div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </main>
            </div>
        </RequireAuth>
    );
}

function StatCard({ icon: Icon, label, value, subtext, highlight, onClick }: { icon: React.ComponentType<{ className?: string }>, label: string, value: string, subtext: string, highlight?: boolean, onClick?: () => void }) {
    return (
        <Card
            onClick={onClick}
            className={`bg-[#0A0A0A] border-white/5 hover:border-blue-600/30 transition-all duration-300 group overflow-hidden relative cursor-pointer ${highlight ? "border-amber-500/30 ring-1 ring-amber-500/20" : ""}`}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${highlight ? "text-amber-400" : "text-gray-500 group-hover:text-blue-400"}`}>
                    {label}
                </CardTitle>
                <div className={`p-2 rounded-lg transition-colors ${highlight ? "bg-amber-500/10" : "bg-white/5 group-hover:bg-blue-600/10"}`}>
                    <Icon className={highlight ? "text-amber-500" : "text-blue-500 group-hover:text-blue-400"} />
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-black group-hover:scale-105 origin-left transition-transform duration-300 ${highlight ? "text-amber-400" : "text-white"}`}>{value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{subtext}</span>
                    <ChevronRight size={10} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
            </CardContent>
            {/* Hover subtle glow */}
            <div className={`absolute inset-0 transition-colors pointer-events-none ${highlight ? "bg-amber-500/5" : "bg-blue-600/0 group-hover:bg-blue-600/5"}`} />
        </Card>
    );
}
