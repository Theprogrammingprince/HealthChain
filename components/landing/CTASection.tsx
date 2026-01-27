"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck, HeartPulse } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/[0.03] blur-[120px] rounded-full" />
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto rounded-[4rem] bg-slate-900 p-16 md:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.5)]"
                >
                    {/* Abstract Glow */}
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-10 border border-white/20 backdrop-blur-sm tracking-widest uppercase"
                    >
                        <HeartPulse className="h-5 w-5 text-primary" />
                        Join the future of Healthcare
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-10 leading-[1.1]">
                        Ready to own your <br />
                        <span className="text-primary italic font-serif leading-[1.2]">health history?</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-slate-300 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                        Join patients and providers around the world using HealthChain to ensure secure, instant care for everyone.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button size="lg" className="rounded-full px-12 h-20 text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 group">
                            Get Early Access
                            <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <div className="flex items-center gap-3 text-slate-400 font-bold">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <span>Clinical Grade Security</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
