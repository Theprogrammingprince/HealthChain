"use client";

import { motion } from "framer-motion";
import { WalletConnect } from "@/components/features/WalletConnect";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Pill, Activity } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function HeroSection() {
    const { isConnected } = useAppStore();

    return (
        <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 overflow-hidden">
            {/* Background Pulse Effect - Kept subtle, but relying more on global particles now */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.05, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px]"
                />
            </div>

            <div className="z-10 text-center max-w-4xl space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full border border-blue-500/20 backdrop-blur-sm">
                        Deentralized Health Records
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                        Own Your Health Data. <br />
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent animate-pulse">Access Anywhere.</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Secure, patient-owned medical history on the blockchain.
                        Grant emergency read-only access in seconds via QR.
                    </p>
                </motion.div>

                {/* EKG Animation - Enhanced Accessibility */}
                <div className="relative h-24 w-full max-w-xl mx-auto" aria-hidden="true">
                    <svg viewBox="0 0 500 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="20%" stopColor="#3b82f6" />
                                <stop offset="80%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        {/* Static faint line */}
                        <path d="M0 50 H150 L160 30 L170 70 L180 20 L190 80 L200 50 H500" stroke="#333" strokeWidth="2" fill="none" opacity="0.5" />

                        {/* Animated pulse */}
                        <motion.path
                            d="M0 50 H150 L160 30 L170 70 L180 20 L190 80 L200 50 H500"
                            stroke="url(#gradient)"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    {isConnected ? (
                        <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all bg-blue-600 hover:bg-blue-700 border-none text-white">
                            <Link href="/dashboard">
                                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild size="lg" className="h-12 px-10 text-lg rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all bg-blue-600 hover:bg-blue-700 border-none text-white font-bold">
                            <Link href="/auth">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    )}

                    <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 text-gray-300 hover:text-white rounded-full px-8" asChild>
                        <Link href="#how-it-works">How It Works</Link>
                    </Button>
                </motion.div>
            </div>

            {/* Floating Medical Elements - Adjusted styling to be more subtle */}
            <FloatingElement className="top-24 left-[10%] text-blue-500/20" delay={0}>
                <Pill className="h-12 w-12 rotate-45" />
            </FloatingElement>

            <FloatingElement className="bottom-32 right-[15%] text-red-500/20" delay={1.5}>
                <Activity className="h-16 w-16" />
            </FloatingElement>

            {/* Note: Other floating elements kept as is but ensure parent overflow-hidden handles them */}

            {/* SOS Blinker */}
            <div className="absolute top-24 right-10 lg:right-24 hidden lg:block opacity-60 animate-bounce delay-1000 z-20">
                <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-xl backdrop-blur-md">
                    <div className="h-8 w-8 rounded-full bg-red-500/80 flex items-center justify-center font-bold text-[10px] text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse">SOS</div>
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
