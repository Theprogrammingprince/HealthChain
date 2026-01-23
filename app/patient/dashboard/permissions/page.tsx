"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, Shield, User, Clock, Trash2, ArrowLeft, Activity, Building2 } from "lucide-react";
import { GrantAccessDialog } from "@/components/dashboard/GrantAccessDialog";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PermissionsPage() {
    const { accessPermissions, fetchUserProfile, supabaseUser } = useAppStore();
    const [isGrantOpen, setIsGrantOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleRevoke = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to revoke access for ${name}?`)) return;

        try {
            const { error } = await supabase
                .from('access_permissions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success(`Access revoked for ${name}`);
            fetchUserProfile();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to revoke access");
        }
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
                                <span className="text-[10px] font-bold text-[#00BFFF] uppercase tracking-[0.2em]">Permissions</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => router.push('/patient/dashboard')} className="text-sm font-bold uppercase tracking-widest text-[#00BFFF]">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    {/* Title Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Access Governance</h1>
                            <p className="text-gray-400 font-medium">Manage who can see your medical data</p>
                        </div>
                        <Button
                            onClick={() => setIsGrantOpen(true)}
                            className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-black uppercase tracking-widest rounded-xl h-12 px-8 shadow-[0_0_20px_rgba(0,191,255,0.3)]"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Grant New Access
                        </Button>
                    </div>

                    {/* Permissions List */}
                    <motion.section variants={itemVariants} className="space-y-6">
                        {accessPermissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white/2 border border-dashed border-white/10 rounded-3xl">
                                <Shield className="w-16 h-16 text-gray-700 mb-6" />
                                <h3 className="text-xl font-bold text-gray-300">No Access Granted</h3>
                                <p className="text-gray-500 max-w-md text-center mt-2 mb-8">
                                    Your data is currently private. Grant access to family members or doctors to allow them to view your records during emergencies.
                                </p>
                                <Button onClick={() => setIsGrantOpen(true)} variant="outline" className="border-white/10 hover:bg-white/5">
                                    Grant Your First Permission
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {accessPermissions.map((perm: any) => {
                                    const isHospital = perm.entityType === 'hospital';
                                    const levelColors: Record<string, { border: string; text: string; bg: string }> = {
                                        'view_summary': { border: 'border-gray-500/30', text: 'text-gray-400', bg: 'bg-gray-500/10' },
                                        'view_records': { border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                        'emergency_access': { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
                                        'full_access': { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' },
                                        'emergency_override': { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
                                        'admin': { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' },
                                    };
                                    const colors = levelColors[perm.level] || levelColors['view_records'];

                                    return (
                                        <div key={perm.id} className="group bg-white/5 border border-white/10 hover:border-[#00BFFF]/50 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRevoke(perm.id, perm.entityName)}
                                                    className="h-8 w-8 hover:bg-red-500/20 hover:text-red-500 rounded-full"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`p-3 rounded-2xl border border-white/5 ${isHospital ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'}`}>
                                                    {isHospital ? <Building2 className="w-6 h-6 text-blue-400" /> : <User className="w-6 h-6 text-[#00BFFF]" />}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors.border} ${colors.text} ${colors.bg}`}>
                                                    {perm.level.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg leading-tight">{perm.entityName}</h3>
                                                        {isHospital && (
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Hospital</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono truncate">{perm.entityAddress}</p>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 p-3 rounded-xl">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Granted: {perm.grantedDate}</span>
                                                </div>

                                                {(perm.level === 'emergency_access' || perm.level === 'emergency_override') && (
                                                    <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-wide">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        SOS Alert Recipient
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.section>

                    {/* Information Section */}
                    <motion.section variants={itemVariants} className="bg-gradient-to-br from-[#00BFFF]/5 to-transparent border border-[#00BFFF]/10 rounded-3xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-[#00BFFF]/10 rounded-2xl hidden md:block">
                                <ShieldCheck className="w-8 h-8 text-[#00BFFF]" />
                            </div>
                            <div className="space-y-6 flex-1">
                                <h3 className="text-xl font-bold">Understanding Access Levels</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div className="p-4 bg-white/5 rounded-xl border border-gray-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                                            <strong className="text-gray-300">View Summary Only</strong>
                                        </div>
                                        <p className="text-gray-500 text-xs">Basic health info, allergies, and blood type. Best for general inquiries or pharmacies.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <strong className="text-emerald-300">View All Records</strong>
                                        </div>
                                        <p className="text-gray-500 text-xs">Full read access to all records, lab results, and prescriptions. For regular doctors and hospitals.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-amber-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            <strong className="text-amber-300">Emergency Access</strong>
                                        </div>
                                        <p className="text-gray-500 text-xs">Instant SOS alerts and critical data access. For emergency contacts and first responders.</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-purple-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                                            <strong className="text-purple-300">Full Access (Guardian)</strong>
                                        </div>
                                        <p className="text-gray-500 text-xs">Complete control including adding records. For family members or primary physicians.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                </motion.div>

                <GrantAccessDialog isOpen={isGrantOpen} onClose={() => setIsGrantOpen(false)} />
            </main>
        </div>
    );
}
