"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldAlert,
    ShieldCheck,
    PhoneOff,
    Siren,
    Lock,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Hospital,
    Stethoscope
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { TacticalMap } from "./TacticalMap";
import { useRouter } from "next/navigation";

export function GuardianDashboard() {
    const router = useRouter();
    const { emergencyAccess, clearEmergency, activateEmergency } = useAppStore();
    const [demoMode, setDemoMode] = useState(false);

    // Combine real store state with local demo state for preview purposes
    const isEmergencyActive = emergencyAccess.isActive || demoMode;

    const topRef = useRef<HTMLDivElement>(null);

    const handleVeto = () => {
        if (confirm("⚠️ CRITICAL ACTION: Are you sure you want to VETO this emergency request? Access will be immediately revoked.")) {
            clearEmergency();
            setDemoMode(false);
            toast.success("Emergency Access Revoked", {
                description: "The request has been blocked and the entity has been flagged.",
                duration: 5000,
            });
        }
    };

    const triggerSimulation = () => {
        // Activate in global store to test cross-component reactivity
        activateEmergency("p_8291");
        setDemoMode(true);

        toast.error("🚨 EMERGENCY ALERT TRIGGERED", {
            description: "St. Mary's Trauma Center is requesting access for Kenzy S.",
            duration: Infinity,
            action: {
                label: "VIEW NOW",
                onClick: () => {
                    // Scroll to top or refresh view if already here
                    topRef.current?.scrollIntoView({ behavior: 'smooth' });
                    // If we were on another page, router.push('/guardian') would work, 
                    // but we assume we might be here already.
                }
            }
        });
    };

    return (
        <div ref={topRef} className={`w-full rounded-[2rem] border transition-all duration-1000 overflow-hidden relative flex flex-col min-h-[90vh]
            ${isEmergencyActive
                ? "bg-red-950/30 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.5)]"
                : "bg-emerald-950/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"}`
        }>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {isEmergencyActive ? (
                    <>
                        <div className="absolute top-0 right-0 w-full md:w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-full md:w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse delay-75" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
                    </>
                )}
            </div>

            {/* Header / Status Bar */}
            <header className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-8 py-6 border-b border-white/5 backdrop-blur-md gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors duration-500 shrink-0
                        ${isEmergencyActive ? "bg-red-500 text-white animate-bounce" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {isEmergencyActive ? <Siren size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">Guardian Link</h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isEmergencyActive ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isEmergencyActive ? "text-red-400" : "text-emerald-500"}`}>
                                {isEmergencyActive ? "CRITICAL ALERT: BREACH ATTEMPT" : "System Secure • Monitoring"}
                            </span>
                        </div>
                    </div>
                </div>

                {!isEmergencyActive && (
                    <Button
                        variant="outline"
                        onClick={triggerSimulation}
                        className="w-full md:w-auto bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 font-bold tracking-wider"
                    >
                        SIMULATE EMERGENCY
                    </Button>
                )}
            </header>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 p-4 md:p-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isEmergencyActive ? (
                        <motion.div
                            key="emergency"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Left Panel: Alert Details */}
                            <div className="space-y-6 flex flex-col order-2 lg:order-1">
                                <div className="p-6 md:p-8 rounded-[2rem] bg-red-500/10 border border-red-500/30 backdrop-blur-xl">
                                    <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-red-100 flex items-center gap-2">
                                                <AlertTriangle className="text-red-500" />
                                                Access Request Detected
                                            </h3>
                                            <p className="text-red-300/60 text-sm mt-2">Authenticity verification pending your manual review.</p>
                                        </div>
                                        <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-mono whitespace-nowrap">
                                            ID: #REQ-9921-ALPHA
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-red-500/10 hover:border-red-500/30 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <Hospital className="text-red-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-red-300/50 uppercase tracking-wider font-bold">Requesting Entity</p>
                                                <p className="font-bold text-white text-lg md:text-xl">St. Mary&apos;s Trauma Center</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20">Accredited Level 1</div>
                                                    <div className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] font-bold border border-white/5">ER Dept</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-red-500/10 hover:border-red-500/30 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <Stethoscope className="text-red-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-red-300/50 uppercase tracking-wider font-bold">Medical Context</p>
                                                <p className="font-bold text-white text-base">Unconscious Admission</p>
                                                <p className="text-xs text-gray-400 mt-1">Provider flagged request as &quot;Life Threatening&quot;</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-red-500/10 hover:border-red-500/30 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <Clock className="text-red-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-red-300/50 uppercase tracking-wider font-bold">Timestamp</p>
                                                <p className="font-bold text-white text-lg">{format(new Date(), "HH:mm:ss")} <span className="text-sm font-normal text-white/50">(Just now)</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION CONTROLS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleVeto}
                                        className="w-full group relative overflow-hidden rounded-[1.5rem] bg-red-600 p-6 text-center shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all hover:bg-red-500 hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] cursor-pointer border-2 border-red-400/50 flex flex-col items-center justify-center gap-2"
                                    >
                                        <PhoneOff size={32} className="text-white" />
                                        <div>
                                            <span className="block text-xl font-black text-white uppercase tracking-tighter">VETO</span>
                                            <span className="block text-red-200 text-[10px] uppercase font-bold tracking-wider">Deny & Lock</span>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            toast.success("Access Granted", { description: "Identity Verified. Emergency Protocol Deactivated." });
                                            clearEmergency();
                                            // Optional: Add logic here to whitelist the provider permanently if needed
                                        }}
                                        className="w-full group relative overflow-hidden rounded-[1.5rem] bg-emerald-600 p-6 text-center shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] cursor-pointer border-2 border-emerald-400/50 flex flex-col items-center justify-center gap-2"
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:200%_0,0_0] duration-[1500ms]" />
                                        <ShieldCheck size={32} className="text-white relative z-10" />
                                        <div className="relative z-10">
                                            <span className="block text-xl font-black text-white uppercase tracking-tighter">GRANT</span>
                                            <span className="block text-emerald-200 text-[10px] uppercase font-bold tracking-wider">Authorize Access</span>
                                        </div>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Right Panel: Patient Location (Tactical Map) */}
                            <div className="h-[400px] lg:h-auto order-1 lg:order-2">
                                <TacticalMap isActive={isEmergencyActive} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-8 max-w-2xl py-10"
                        >
                            <div className="w-40 h-40 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
                                <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
                                <Lock size={64} className="text-emerald-500" />
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold text-white mb-4">Systems Nominal</h3>
                                <p className="text-gray-400 leading-relaxed text-lg">
                                    You are the designated Guardian for <span className="text-white font-bold">Kenzy S.</span>
                                    <br />
                                    The HealthChain network is actively monitoring for authorization requests.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-emerald-500 mb-3"><CheckCircle2 size={32} /></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Health ID Status</p>
                                    <p className="text-white font-mono text-xl">ACTIVE</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-emerald-500 mb-3"><Activity size={32} /></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Watchtower Link</p>
                                    <p className="text-white font-mono text-xl">SYNCED</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
