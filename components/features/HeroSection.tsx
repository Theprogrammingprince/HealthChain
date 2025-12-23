"use client";

import { motion } from "framer-motion";
import { WalletConnect } from "@/components/features/WalletConnect";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Pill, Syringe, Dna, Microscope, Activity, Stethoscope } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function HeroSection() {
    const { isConnected } = useAppStore();

    return (
        <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 overflow-hidden">
            {/* Background Pulse Effect */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
                />
            </div>

            <div className="z-10 text-center max-w-4xl space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full border border-primary/20">
                        Decentralized Health Records
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Own Your Health Data. <br />
                        <span className="text-primary glow-text">Access Anywhere.</span>
                    </h1>
                    <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Secure, patient-owned medical history on the blockchain.
                        Grant emergency read-only access in seconds via QR.
                    </p>
                </motion.div>

                {/* EKG Animation */}
                <div className="relative h-32 w-full max-w-2xl mx-auto">
                    <svg viewBox="0 0 500 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="10%" stopColor="#00BFFF" />
                                <stop offset="90%" stopColor="#00BFFF" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        {/* Static faint line */}
                        <path d="M0 50 H100 L110 40 L120 60 L130 20 L140 80 L150 50 H500" stroke="#333" strokeWidth="2" fill="none" />

                        {/* Animated pulse */}
                        <motion.path
                            d="M0 50 H100 L110 40 L120 60 L130 20 L140 80 L150 50 H500"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    {isConnected ? (
                        <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(0,191,255,0.4)] hover:shadow-[0_0_30px_rgba(0,191,255,0.6)] transition-all">
                            <Link href="/dashboard">
                                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    ) : (
                        <div className="scale-125 origin-top">
                            <WalletConnect />
                        </div>
                    )}

                    <Button variant="ghost" className="text-muted-foreground hover:text-white" asChild>
                        <Link href="/emergency">View Emergency Demo</Link>
                    </Button>
                </motion.div>
            </div>

            {/* Floating Medical Elements */}
            <FloatingElement className="top-20 left-[10%] text-blue-500/40" delay={0}>
                <Pill className="h-12 w-12 rotate-45" />
            </FloatingElement>

            <FloatingElement className="bottom-32 right-[15%] text-red-500/40" delay={1.5}>
                <Activity className="h-16 w-16" />
            </FloatingElement>

            <FloatingElement className="top-40 right-[10%] text-green-500/30" delay={0.5}>
                <Syringe className="h-10 w-10 -rotate-12" />
            </FloatingElement>

            <FloatingElement className="bottom-20 left-[20%] text-purple-500/30" delay={2}>
                <Dna className="h-14 w-14 rotate-90" />
            </FloatingElement>

            <FloatingElement className="top-1/4 left-[5%] text-cyan-500/20 hidden md:block" delay={3}>
                <Microscope className="h-20 w-20" />
            </FloatingElement>

            <FloatingElement className="bottom-1/3 right-[5%] text-orange-500/20 hidden md:block" delay={1}>
                <Stethoscope className="h-24 w-24 rotate-12" />
            </FloatingElement>

            {/* SOS Blinker */}
            <div className="absolute top-24 right-24 hidden lg:block opacity-60 animate-bounce delay-1000">
                <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-xl backdrop-blur-sm">
                    <div className="h-8 w-8 rounded-full bg-destructive/60 flex items-center justify-center font-bold text-xs text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse">SOS</div>
                </div>
            </div>
        </section>
    );
}

function FloatingElement({ children, className, delay }: { children: React.ReactNode, className?: string, delay: number }) {
    return (
        <motion.div
            className={`absolute z-0 ${className}`}
            initial={{ y: 0, opacity: 0 }}
            animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 5, -5, 0]
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
}
