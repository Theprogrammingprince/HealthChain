"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldAlert,
    ShieldCheck,
    MapPin,
    PhoneOff,
    Siren,
    Lock,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export function GuardianDashboard() {
    const { emergencyAccess, clearEmergency, activateEmergency } = useAppStore();
    const [demoMode, setDemoMode] = useState(false);

    // Combine real store state with local demo state for preview purposes
    const isEmergencyActive = emergencyAccess.isActive || demoMode;

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
        activateEmergency("p_8291"); // Using hardcoded patient ID for demo
        setDemoMode(true);

        toast.error("🚨 EMERGENCY ALERT TRIGGERED", {
            description: "St. Mary's Trauma Center is requesting access for Kenzy S.",
            duration: Infinity,
            action: {
                label: "VIEW NOW",
                onClick: () => console.log("Navigating to dashboard..."),
            }
        });
    };

    return (
        <div className={`min-h-[80vh] w-full rounded-3xl border transition-all duration-1000 overflow-hidden relative flex flex-col
            ${isEmergencyActive
                ? "bg-red-950/30 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.5)]"
                : "bg-emerald-950/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"}`
        }>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {isEmergencyActive ? (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse delay-75" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
                    </>
                )}
            </div>

            {/* Header / Status Bar */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors duration-500
                        ${isEmergencyActive ? "bg-red-500 text-white animate-bounce" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {isEmergencyActive ? <Siren size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Guardian Link</h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isEmergencyActive ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
                            <span className={`text-xs font-bold uppercase tracking-widest ${isEmergencyActive ? "text-red-400" : "text-emerald-500"}`}>
                                {isEmergencyActive ? "CRITICAL ALERT: BREACH ATTEMPT" : "System Secure • Monitoring"}
                            </span>
                        </div>
                    </div>
                </div>

                {!isEmergencyActive && (
                    <Button
                        variant="outline"
                        onClick={triggerSimulation}
                        className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 font-bold tracking-wider"
                    >
                        SIMULATE EMERGENCY
                    </Button>
                )}
            </header>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 p-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isEmergencyActive ? (
                        <motion.div
                            key="emergency"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Left Panel: Alert Details */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-red-100 flex items-center gap-2">
                                                <AlertTriangle className="text-red-500" />
                                                Access Request Detected
                                            </h3>
                                            <p className="text-red-300/60 text-sm mt-1">Authenticity verification pending manual review.</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-mono">
                                            ID: #REQ-9921
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-red-500/10">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <Activity className="text-red-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-red-300/50 uppercase tracking-wider">Requesting Entity</p>
                                                <p className="font-bold text-white text-lg">St. Mary's Trauma Center</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-red-500/10">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <Clock className="text-red-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-red-300/50 uppercase tracking-wider">Timestamp</p>
                                                <p className="font-bold text-white text-lg">{format(new Date(), "HH:mm:ss")} <span className="text-sm font-normal text-white/50">(Just now)</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* THE VETO BUTTON */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleVeto}
                                    className="w-full group relative overflow-hidden rounded-3xl bg-red-600 p-8 text-center shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] cursor-pointer border-2 border-red-400"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:200%_0,0_0] duration-[1500ms]" />
                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                        <PhoneOff size={48} className="text-white mb-2" />
                                        <span className="text-3xl font-black text-white uppercase tracking-tighter">VETO REQUEST</span>
                                        <span className="text-red-200 font-medium tracking-wide text-sm">Block Access & Lock Protocol</span>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Right Panel: Patient Location */}
                            <div className="relative rounded-3xl overflow-hidden border border-red-500/20 bg-black/40 backdrop-blur-xl h-[500px]">
                                {/* Map Overlay UI */}
                                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            Live GPS Tracking (Emergency Mode)
                                        </p>
                                        <p className="text-white font-mono text-sm mt-1">Last Ping: 12ms ago</p>
                                    </div>
                                    <div className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
                                        <p className="text-[10px] font-bold text-red-400">ACCURACY: ±3m</p>
                                    </div>
                                </div>

                                {/* Simulated Map */}
                                <div className="absolute inset-0 bg-[#1a1d24] flex items-center justify-center">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 opacity-10"
                                        style={{
                                            backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                                            backgroundSize: '40px 40px'
                                        }}
                                    />

                                    {/* Radar Animation */}
                                    <div className="relative">
                                        <div className="w-64 h-64 border border-red-500/30 rounded-full flex items-center justify-center relative">
                                            <div className="absolute inset-0 border border-red-500/10 rounded-full animate-ping [animation-duration:2s]" />
                                            <div className="w-48 h-48 border border-red-500/20 rounded-full" />
                                            <div className="w-32 h-32 border border-red-500/30 rounded-full" />

                                            {/* Patient Dot */}
                                            <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(220,38,38,1)] z-10" />

                                            {/* Rotating Scan */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent rounded-full animate-spin [animation-duration:4s]" />
                                        </div>
                                    </div>

                                    {/* Map Labels */}
                                    <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin size={14} className="text-red-500" />
                                            <span className="text-white font-bold text-sm">Trauma Wing B</span>
                                        </div>
                                        <p className="text-gray-400 text-xs">St. Mary's Medical Center</p>
                                        <p className="text-gray-500 text-[10px] uppercase mt-1">40.7128° N, 74.0060° W</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-6 max-w-lg"
                        >
                            <div className="w-32 h-32 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative">
                                <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
                                <Lock size={48} className="text-emerald-500" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Systems Nominal</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    You are the designated Guardian for <span className="text-white font-bold">Kenzy S.</span>
                                    <br />
                                    We will notify you immediately if emergency access is attempted.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="text-emerald-500 mb-2"><CheckCircle2 size={20} /></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Health ID</p>
                                    <p className="text-white font-mono">Active</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="text-emerald-500 mb-2"><CheckCircle2 size={20} /></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Watchtower</p>
                                    <p className="text-white font-mono">Synced</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
