"use client";

import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Zap, Heart, Activity } from "lucide-react";
import Image from "next/image";

export function SolutionSection() {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 relative order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 rounded-[3rem] overflow-hidden border border-primary/10 shadow-2xl medical-glow"
                        >
                            <div className="aspect-square relative bg-slate-50">
                                <Image
                                    src="/images/landing/solution_abstract.png"
                                    alt="Medical Data Visualization"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

                                {/* Floating UI Card over image */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="absolute bottom-10 right-10 left-10 clinical-glass p-6 rounded-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-xl">
                                            <ShieldCheck className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-primary uppercase tracking-widest">Verified Status</p>
                                            <h4 className="text-xl font-black text-slate-900">Patient Data Secured</h4>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                        {/* Background blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 blur-[120px] -z-10 rounded-full" />
                    </div>

                    <div className="flex-1 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                HealthChain unifies your medical history.
                            </h2>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                A high-performance platform designed for the complexities of modern healthcare. We bridge the gap between fragmented data and life-saving care.
                            </p>

                            <div className="grid gap-6 mt-12">
                                {[
                                    { icon: <ShieldCheck className="h-6 w-6" />, title: "Secure & Verified", desc: "Multi-layered verification from world-class healthcare institutions." },
                                    { icon: <UserCheck className="h-6 w-6" />, title: "Patient-Controlled", desc: "Granular access controls putting you in charge of your sensitive data." },
                                    { icon: <Zap className="h-6 w-6" />, title: "Real-time Access", desc: "Optimized for emergency scenarios where every millisecond matters." }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-5 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group"
                                    >
                                        <div className="mt-1 bg-white p-3 rounded-xl border border-slate-100 group-hover:border-primary/20 text-primary shadow-sm">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-xl mb-1">{item.title}</h3>
                                            <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
