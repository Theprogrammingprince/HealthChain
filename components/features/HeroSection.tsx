"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function HeroSection() {
    const { isConnected } = useAppStore();

    return (
        <section className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-[#030303]">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.2, 0.3],
                        x: [0, 10, 0],
                        y: [0, -10, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_50%)] blur-[120px]"
                />
                <div
                    className="absolute inset-0 bg-repeat opacity-[0.02] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            <div className="z-10 text-center max-w-[90vw] md:max-w-7xl space-y-16">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="inline-block px-8 py-2.5 mb-12 text-[11px] font-bold tracking-[0.4em] text-blue-500 uppercase bg-blue-500/5 rounded-full border border-blue-500/10 backdrop-blur-xl">
                        Global Health Identity
                    </div>

                    <h1 className="text-6xl sm:text-8xl md:text-[11rem] font-bold tracking-[-0.05em] leading-[0.82] text-white">
                        Access Instant. <br />
                        <span className="text-white/30 hover:text-white/60 transition-colors duration-1000 cursor-default">
                            Always Yours.
                        </span>
                    </h1>

                    <p className="mt-12 text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light tracking-tight">
                        Your medical history should be as portable as your identity.
                        Secure, private, and ready for emergencies—anywhere in the world.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6"
                >
                    <Button asChild size="lg" className="h-16 px-12 text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-500 tracking-tight font-medium">
                        <Link href={isConnected ? "/patient/dashboard" : "/auth"}>
                            {isConnected ? "Open Dashboard" : "Create Identity"} <ArrowRight className="ml-3 h-5 w-5" />
                        </Link>
                    </Button>

                    <Link href="#how-it-works" className="group text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-white transition-colors duration-300 flex items-center gap-3">
                        <span className="w-12 h-px bg-gray-800 group-hover:w-20 group-hover:bg-blue-500 transition-all duration-700" />
                        EXPLORE SYSTEM
                    </Link>
                </motion.div>
            </div>

            {/* Subtle EKG - more architectural */}
            <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 1000 100" className="w-full h-full">
                    <motion.path
                        d="M0 50 L200 50 L210 30 L220 70 L230 20 L240 80 L250 50 L1000 50"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
            </div>
        </section>
    );
}
