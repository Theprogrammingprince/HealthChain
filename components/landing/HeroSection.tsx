"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronRight, Shield, Lock } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-white">
            {/* Background Cinematic Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/landing/hero_lifestyle.png"
                    alt="Clinical Background"
                    fill
                    className="object-cover opacity-10"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
            </div>

            {/* Floating Medical Icons in Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-10 text-primary/30"
                >
                    <Image src="/logo.svg" alt="" width={120} height={120} className="opacity-30" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-10 text-primary/30"
                >
                    <Shield size={160} />
                </motion.div>
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-left">
                        {/* Clinical Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-semibold mb-8 border border-primary/10 tracking-wide uppercase"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Clinical Excellence & Trusted Security
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-8 leading-[1.05]"
                        >
                            Your health history. <br />
                            <span className="text-primary italic font-serif">One secure place.</span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-xl leading-relaxed font-medium"
                        >
                            HealthChain provides instant, secure access to your medical records — empowering care when every second counts.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-5"
                        >
                            <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold group shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                                Get Early Access
                                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <div className="flex items-center gap-3 text-muted-foreground font-semibold">
                                <Lock className="h-5 w-5 text-primary" />
                                <span>HIPAA Compliant Security</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Mockup with Glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(30,64,175,0.3)] bg-white">
                            <div className="aspect-[4/5] relative">
                                <Image
                                    src="/images/landing/hero_lifestyle.png"
                                    alt="HealthChain Mobile Dashboard"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Clinical Overlay UI */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-primary p-2 rounded-lg">
                                            <Image src="/logo.svg" alt="HealthChain" width={24} height={24} className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Live Health Vitals</h4>
                                            <p className="text-sm opacity-80">Synced with Provider Network</p>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "85%" }}
                                            transition={{ duration: 2, delay: 1 }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative background visual */}
                        <div className="absolute -top-10 -right-10 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10 animate-pulse" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
