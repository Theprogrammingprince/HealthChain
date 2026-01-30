'use client';

import { Button } from "@/components/ui/button";
import { Activity, Shield, Globe, Users, Target, Heart, Award, Sparkles, ChevronRight, Workflow, Cpu, Zap, Microscope } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Massive Atmospheric Header */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-[1400px] mx-auto text-center space-y-12"
                >
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Sparkles className="w-3 h-3" />
                            <span>The HealthChain Manifesto</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase italic font-serif">
                            Healthcare <br /> <span className="text-blue-600 not-italic font-sans">Protocolized.</span>
                        </h1>
                    </div>

                    <p className="text-xl md:text-3xl text-gray-500 max-w-4xl mx-auto leading-tight font-medium">
                        HealthChain is the coordination layer for 21st-century clinical data.
                        We believe health records should be sovereign, immutable, and instantly accessible.
                    </p>
                </motion.div>
            </section>

            {/* Vision Architecture Section */}
            <section className="py-32 px-6 relative">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-20 md:p-32 rounded-[4rem] bg-zinc-950/50 border border-white/5 relative overflow-hidden text-center group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5 opacity-50 transition-opacity group-hover:opacity-100" />
                            <div className="relative z-10 space-y-12">
                                <Target className="w-20 h-20 text-blue-500 mx-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                                <h1 className="text-4xl md:text-6xl font-black text-white italic font-serif uppercase leading-[1.1] tracking-tighter">
                                    &quot;Our mission is to eliminate clinical fragmentation through decentralized identity and sovereign data ownership.&quot;
                                </h1>
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto" />
                                <p className="text-gray-600 uppercase tracking-[0.4em] font-black text-xs">
                                    Foundation Logic Block v1.0
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values Architecture Grid */}
            <section className="py-32 px-6 bg-zinc-950/20 backdrop-blur-3xl border-y border-white/5">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-24 space-y-6">
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Core <span className="text-blue-500">Parameters.</span></h2>
                        <p className="text-gray-500 text-lg font-medium">The clinical principles that drive our decentralized infrastructure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Immutable Integrity",
                                subtitle: "On-Chain Registry",
                                desc: "Records are anchored to the Polygon network, creating a permanent history that is mathematically tamper-proof.",
                                color: "text-blue-400",
                                border: "border-blue-500/20"
                            },
                            {
                                icon: Globe,
                                title: "Global Mobility",
                                subtitle: "Decentralized Access",
                                desc: "Your clinical identity persists across borders, ensuring care continuity regardless of geographic or institutional silos.",
                                color: "text-emerald-400",
                                border: "border-emerald-500/20"
                            },
                            {
                                icon: Heart,
                                title: "Human Centricity",
                                subtitle: "Patient Sovereignty",
                                desc: "Empowering individuals with absolute control. You own the private keys; you authorize the providers.",
                                color: "text-red-400",
                                border: "border-red-500/20"
                            },
                            {
                                icon: Users,
                                title: "Unified Nexus",
                                subtitle: "Clinician Coordination",
                                desc: "Instantly bridge the data gap between pharmacists, specialists, and primary care physicians on a single protocol.",
                                color: "text-purple-400",
                                border: "border-purple-500/20"
                            },
                            {
                                icon: Microscope,
                                title: "Standardized Logic",
                                subtitle: "FHIR Compliance",
                                desc: "Built on HL7 and FHIR standards to ensure seamless integration with legacy EHR and hospital infrastructure.",
                                color: "text-amber-400",
                                border: "border-amber-500/20"
                            },
                            {
                                icon: Cpu,
                                title: "Agile Scalability",
                                subtitle: "Enterprise Integration",
                                desc: "A robust API architectural layer designed to handle massive clinical throughput for global health systems.",
                                color: "text-cyan-400",
                                border: "border-cyan-500/20"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-10 rounded-[3rem] bg-black border border-white/5 hover:bg-zinc-900 hover:border-blue-500/30 transition-all duration-700 group relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ${item.color}`}>
                                    <item.icon className={`w-8 h-8`} />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 mb-1">{item.subtitle}</p>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                                    </div>
                                    <p className="text-gray-500 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Network Statistics Section */}
            <section className="py-32 px-6 relative overflow-hidden border-b border-white/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_70%)] pointer-events-none" />

                <div className="max-w-[1400px] mx-auto text-center space-y-16 relative z-10">
                    <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic font-serif">
                        Network <span className="text-blue-500 not-italic font-sans">Momentum.</span>
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { number: "50k+", label: "Verified Identities" },
                            { number: "120+", label: "Clinical Nodes" },
                            { number: "10M+", label: "Anchored Payloads" },
                            { number: "15ms", label: "Query Latency" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-4 p-8 rounded-[2.5rem] bg-zinc-950/50 border border-white/5"
                            >
                                <p className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{stat.number}</p>
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] leading-tight">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Future Architecture CTA */}
            <section className="py-32 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
                >
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.9] uppercase italic font-serif tracking-tighter">
                                Building for <br />
                                <span className="text-blue-600 not-italic font-sans">Human Health.</span>
                            </h2>
                            <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-xl">
                                HealthChain began with a fundamental question: Why is clinical data still fragmented?
                                Today, we are protocolizing healthcare for the global population.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <Link href="/careers">
                                <Button size="lg" className="rounded-2xl px-12 h-20 text-xl font-black bg-white text-black hover:bg-zinc-200 transition-all group uppercase tracking-widest">
                                    Join Protocol
                                    <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-4 text-gray-600 font-black uppercase tracking-widest text-[10px]">
                                <Workflow className="w-4 h-4 text-blue-500" />
                                <span>Developing v3.0 Mainnet</span>
                            </div>
                        </div>
                    </div>

                    {/* Industrial Visualization Overlay */}
                    <div className="relative aspect-square lg:scale-110">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-[5rem] blur-[100px] animate-pulse" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[40px] border-white/[0.02] rounded-[5rem] border-dashed"
                        />
                        <div className="absolute inset-8 bg-black border border-white/5 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center space-y-8 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
                            <Activity className="w-32 h-32 text-blue-600 animate-pulse" />
                            <div className="space-y-2">
                                <p className="text-sm font-black uppercase tracking-[0.5em] text-gray-500">Node Heartbeat</p>
                                <p className="text-emerald-500 font-mono text-xs">100% Operational</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Dynamic Final CTA Architecture */}
            <section className="py-48 px-6 text-center border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full" />

                <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-none uppercase italic font-serif">
                        Execute <br />
                        <span className="not-italic font-sans text-blue-600">Sovereignty.</span>
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                        <Link href="/signup">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-16 h-24 text-2xl font-black uppercase tracking-widest shadow-3xl shadow-blue-600/30 transition-all group overflow-hidden">
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-12 h-24 text-xl font-black uppercase tracking-widest min-w-[280px]">
                                Contact Hub
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-20 flex flex-col items-center gap-4">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">HealthChain Protocol Layer v2.4.9</p>
                        <div className="flex gap-8">
                            <Zap className="w-4 h-4 text-blue-500/20" />
                            <Shield className="w-4 h-4 text-blue-500/20" />
                            <Globe className="w-4 h-4 text-blue-500/20" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
