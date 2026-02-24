"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search, FileQuestion, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden min-h-[70vh]">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.03 }}
                    className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-xl w-full text-center relative z-10">
                {/* 404 Visual */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative inline-block mb-12"
                >
                    <div className="text-[12rem] font-black leading-none text-gray-100 select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="p-6 bg-white rounded-3xl shadow-2xl shadow-primary/10 border border-gray-100"
                        >
                            <ShieldAlert className="w-16 h-16 text-primary" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        Pathological Error: Page Not Found
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                        We searched our entire database but couldn&apos;t find the record you were looking for. The link might be broken or the page moved.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-14 font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                        >
                            <Link href="/">
                                <Home className="w-5 h-5 mr-2" />
                                Back to Headquarters
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-gray-100 hover:border-primary/20 hover:bg-primary/5 text-gray-700 rounded-xl px-8 h-14 font-semibold transition-all w-full sm:w-auto"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Return Previous Session
                        </Button>
                    </div>

                    {/* Diagnostic Info */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status Code</span>
                                <span className="text-sm font-mono font-bold text-red-500">404: ABSENT</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">System Health</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-emerald-500 uppercase tracking-tight">Operational</span>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Micro-animations: Floating Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary/20 rounded-full hidden lg:block"
                    animate={{
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                />
            ))}
        </div>
    );
}
