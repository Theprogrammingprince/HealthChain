"use client";

import { Activity, Lock, Mail, ArrowLeft, ArrowRight, Shield, Zap, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLoginButton } from "@/components/features/GoogleLoginButton";
import { WalletConnectButton } from "@/components/features/WalletConnectButton";
import { EmailAuthForm } from "@/components/features/EmailAuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
    const { isConnected } = useAccount();
    const router = useRouter();
    const [role, setRole] = useState<'Patient' | 'Hospital'>('Patient');
    const [mode, setMode] = useState<"login" | "signup">("login");
    const { setUserRole } = useAppStore();

    useEffect(() => {
        // Sync role to localStorage so other auth components can access it
        localStorage.setItem('healthchain_intended_role', role.toLowerCase());
    }, [role]);

    const benefits = {
        Patient: [
            { icon: Shield, text: "Self-Sovereign Identity" },
            { icon: Lock, text: "End-to-End Encryption" },
            { icon: Database, text: "Full Data Portability" }
        ],
        Hospital: [
            { icon: Zap, text: "Real-time Interoperability" },
            { icon: Shield, text: "HIPAA Compliant Node" },
            { icon: Database, text: "Audited Case History" }
        ],
        Admin: [
            { icon: Shield, text: "Network Governance" },
            { icon: Activity, text: "System Monitoring" },
            { icon: Lock, text: "Permission Control" }
        ]
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors group z-20">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
            >
                {/* Left Side: Dynamic Info */}
                <div className="hidden lg:block space-y-8 pr-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl">
                                <Activity className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                                {role === 'Patient' ? 'Patient' : role === 'Hospital' ? 'Clinical' : 'Admin'} <br />
                                <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">Intelligence</span>
                            </h2>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md">
                                {role === 'Patient'
                                    ? "Securely manage your medical history, own your data, and grant access to providers on your terms."
                                    : role === 'Hospital'
                                        ? "Connect with patients in real-time, maintain HIPAA compliance, and streamline clinical workflows."
                                        : "Oversee the HealthChain protocol, manage hospital verifications, and monitor network health."}
                            </p>

                            <div className="space-y-4 pt-4">
                                {benefits[role].map((benefit, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
                                    >
                                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                                            <benefit.icon className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{benefit.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Auth Card */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            <div className="text-center">
                                <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
                                    {mode === "login" ? "Initialize Protocol" : "Join the Network"}
                                </h1>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                    Secure Medical Infrastructure
                                </p>
                            </div>

                            <Tabs defaultValue="Patient" onValueChange={(v) => setRole(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                                    <TabsTrigger value="Patient" className="rounded-xl data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black text-gray-500 font-bold uppercase text-[9px] tracking-widest transition-all h-9">
                                        Patient
                                    </TabsTrigger>
                                    <TabsTrigger value="Hospital" className="rounded-xl data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-gray-500 font-bold uppercase text-[9px] tracking-widest transition-all h-9">
                                        Clinical
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-6">
                                <EmailAuthForm mode={mode} role={role} />

                                <div className="text-center">
                                    <button
                                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        {mode === "login" ? "Need a medical profile?" : "Already verified?"} {mode === "login" ? "Create Account" : "Sign In"}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
                                    <span className="bg-[#121212] px-4 text-gray-600">Advanced Access</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <GoogleLoginButton role={role} />
                                <WalletConnectButton />
                            </div>

                            {/* Trust Badge */}
                            <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                <Lock className="w-3 h-3" />
                                <span>End-to-End Encrypted Node</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
