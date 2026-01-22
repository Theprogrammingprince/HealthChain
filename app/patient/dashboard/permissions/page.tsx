"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, TrasSh2, Shield, User, Clock, Trash2, ArrowLeft, Activity } from "lucide-react";
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
                                {accessPermissions.map((perm) => (
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
                                            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-white/5">
                                                <User className="w-6 h-6 text-[#00BFFF]" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${perm.level === 'emergency_override' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                    perm.level === 'admin' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                                                        'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                                }`}>
                                                {perm.level.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight mb-1">{perm.entityName}</h3>
                                                <p className="text-xs text-gray-500 font-mono truncate">{perm.entityAddress}</p>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 p-3 rounded-xl">
                                                <Clock className="w-3 h-3" />
                                                <span>Granted: {perm.grantedDate}</span>
                                            </div>

                                            {perm.level === 'emergency_override' && (
                                                <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-wide">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Updates on Emergency
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>

                    {/* Information Section */}
                    <motion.section variants={itemVariants} className="bg-gradient-to-br from-[#00BFFF]/5 to-transparent border border-[#00BFFF]/10 rounded-3xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-[#00BFFF]/10 rounded-2xl hidden md:block">
                                <ShieldCheck className="w-8 h-8 text-[#00BFFF]" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">How Access Works</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-400">
                                    <p>
                                        <strong className="text-white block mb-1">View Records</strong>
                                        Authorized users can basically view your health summary and records but cannot modify anything. Best for general practitioners or family.
                                    </p>
                                    <p>
                                        <strong className="text-white block mb-1">Emergency Override</strong>
                                        These users will be instantly notified if you trigger an SOS. They get special temporary access to critical data needed for rescue.
                                    </p>
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
