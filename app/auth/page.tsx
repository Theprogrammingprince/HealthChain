"use client";

import { Activity, Lock, ArrowLeft, Shield, Zap, Database, ChevronRight, Globe, Fingerprint } from "lucide-react";
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

export default function AuthPage() {
    const { isConnected } = useAccount();
    const router = useRouter();
    const [role, setRole] = useState<'Patient' | 'Hospital' | 'Doctor'>('Patient');
    const [mode, setMode] = useState<"login" | "signup">("login");

    useEffect(() => {
        localStorage.setItem('healthchain_intended_role', role.toLowerCase());
    }, [role]);

    const benefits = {
        Patient: [
            { icon: Shield, text: "Self-Sovereign Identity", desc: "You own the keys to your data." },
            { icon: Lock, text: "End-to-End Encryption", desc: "Pure client-side AES-256 security." },
            { icon: Database, text: "Full Data Portability", desc: "Your records, wherever you go." }
        ],
        Hospital: [
            { icon: Zap, text: "Real-time Interop", desc: "Instant clinical data synchronization." },
            { icon: Globe, text: "HIPAA Compliant Node", desc: "Built for regulatory excellence." },
            { icon: Activity, text: "Audited Case History", desc: "Transparent, immutable trails." }
        ],
        Doctor: [
            { icon: Fingerprint, text: "Verified Credentials", desc: "On-chain professional verification." },
            { icon: Activity, text: "Seamless Documentation", desc: "EHR-agnostic data entry." },
            { icon: Shield, text: "Instant Portability", desc: "Access records across facilities." }
        ]
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 text-gray-500 hover:text-white transition-all group z-50">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Hub</span>
            </Link>

            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left Side: Strategic Info */}
                <div className="hidden lg:block space-y-12 pr-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                    <Activity className="w-3 h-3" />
                                    <span>Protocol Access</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                                    {role === 'Patient' ? 'Patient' : role === 'Hospital' ? 'Clinical' : 'Doctor'} <br />
                                    <span className="text-blue-500 italic font-serif">Intelligence.</span>
                                </h2>
                                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                                    {role === 'Patient'
                                        ? "Own your health history. Manage approvals and access clinical providers on your own terms."
                                        : role === 'Hospital'
                                            ? "Deploy high-performance clinical infrastructure with sovereign data security standards."
                                            : "Bridge the gap with secure documnetation and instant record access across the network."}
                                </p>
                            </div>

                            <div className="grid gap-4 max-w-md">
                                {benefits[role].map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-sm group hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                            <benefit.icon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{benefit.text}</h4>
                                            <p className="text-gray-500 text-xs font-medium">{benefit.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Auth Architecture */}
                <div className="w-full max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-950 border border-white/10 p-10 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group"
                    >
                        {/* Shimmer Ambient */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

                        <div className="relative z-10 space-y-10 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black tracking-tight uppercase leading-none">
                                    {mode === "login" ? "Initialize Access" : "Network Enrollment"}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                                    Protocol Version 2.4.0
                                </p>
                            </div>

                            <Tabs defaultValue="Patient" onValueChange={(v) => setRole(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-black/50 p-1.5 rounded-2xl border border-white/5">
                                    <TabsTrigger value="Patient" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black text-[9px] font-black uppercase tracking-widest h-10 transition-all">
                                        Patient
                                    </TabsTrigger>
                                    <TabsTrigger value="Doctor" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black text-[9px] font-black uppercase tracking-widest h-10 transition-all">
                                        Doctor
                                    </TabsTrigger>
                                    <TabsTrigger value="Hospital" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black text-[9px] font-black uppercase tracking-widest h-10 transition-all">
                                        Clinical
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-8 text-left">
                                <EmailAuthForm mode={mode} role={role as any} />

                                <div className="text-center">
                                    <button
                                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                        className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-colors"
                                    >
                                        {mode === "login" ? "Request a new medical profile?" : "Already verified on the network?"}
                                        <span className="text-blue-500 ml-1">{mode === "login" ? "Create Account" : "Sign In"}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
                                    <span className="bg-zinc-950 px-6 text-gray-700">Advanced Auth</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <GoogleLoginButton role={role} />
                                <WalletConnectButton />
                            </div>

                            {/* Verification Footer */}
                            <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-3 text-[9px] text-gray-600 font-black uppercase tracking-widest">
                                    <Lock className="w-3 h-3 text-emerald-500/50" />
                                    <span>Encrypted Handshake Active</span>
                                </div>
                                <p className="text-[10px] text-gray-700 max-w-xs leading-relaxed font-medium">
                                    Accessing the HealthChain mainnet requires a verified digital wallet or clinical email address.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
