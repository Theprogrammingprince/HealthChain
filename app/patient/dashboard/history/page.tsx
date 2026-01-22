"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, History, Eye, Lock, FileText, UserCheck, Activity, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActivityLog } from "@/lib/store";

export default function AuditHistoryPage() {
    const { activityLogs, fetchUserProfile } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const getIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'viewed': return <Eye size={16} className="text-blue-400" />;
            case 'access granted': return <UserCheck size={16} className="text-emerald-400" />;
            case 'access revoked': return <Lock size={16} className="text-red-400" />;
            case 'emergency access': return <ShieldCheck size={16} className="text-amber-400" />;
            default: return <Activity size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00BFFF]/30 pb-20">
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
                                <span className="text-[10px] font-bold text-[#00BFFF] uppercase tracking-[0.2em]">Audit Logs</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => router.push('/patient/dashboard')} className="text-sm font-bold uppercase tracking-widest text-[#00BFFF]">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="max-w-[1000px] mx-auto px-6 py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    {/* Title Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Security Audit</h1>
                            <p className="text-gray-400 font-medium">Transparent record of every interaction with your medical identity</p>
                        </div>
                    </div>

                    {/* Logs List */}
                    <motion.section variants={itemVariants} className="space-y-6 relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-white/5 md:left-8" />

                        {activityLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white/2 border border-dashed border-white/10 rounded-3xl ml-12">
                                <History className="w-16 h-16 text-gray-700 mb-6" />
                                <h3 className="text-xl font-bold text-gray-300">No Activity Recorded</h3>
                                <p className="text-gray-500 max-w-md text-center mt-2">
                                    Your account is fresh. Once doctors or clinics access your data, it will appear here instantly.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activityLogs.map((log) => (
                                    <div key={log.id} className="relative pl-16 md:pl-20 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-4 md:left-6 top-5 w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-[#00BFFF]/50 group-hover:border-[#00BFFF] group-hover:scale-125 transition-all z-10" />

                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 group-hover:border-[#00BFFF]/30 transition-all duration-300">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                                            {getIcon(log.action)}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{log.date}</span>
                                                    </div>

                                                    <p className="text-lg">
                                                        <span className="font-bold text-white">{log.actor}</span>
                                                        <span className="text-gray-400 mx-1.5">{log.action.toLowerCase()}</span>
                                                        {log.details && (
                                                            <span className="text-[#00BFFF] font-medium">{log.details}</span>
                                                        )}
                                                        {!log.details && (
                                                            <span className="text-gray-500 italic">your records</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {log.txHash && (
                                                    <div className="hidden md:block text-right">
                                                        <span className="text-[10px] font-bold text-gray-600 block uppercase tracking-widest mb-1">Blockchain Hash</span>
                                                        <span className="font-mono text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded block truncate max-w-[150px]">
                                                            {log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
}
