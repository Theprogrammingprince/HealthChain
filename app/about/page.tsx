'use client';
import { Button } from "@/components/ui/button";
import { Activity, Shield, Globe, Users, Target, Heart, Award, Sparkles, ChevronRight, Workflow } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                {/* Background Visuals */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-6xl mx-auto text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Our Mission</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 bg-gradient-to-b from-white via-white/90 to-zinc-700 bg-clip-text text-transparent leading-[1.1]">
                        Healing through <br />
                        <span className="text-blue-500 italic font-serif">Decentralization.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
                        HealthChain is building the world&apos;s first truly patient-owned medical record system.
                        We believe health data belongs to the patient, not the institution.
                    </p>
                </motion.div>
            </section>

            {/* Vision Quote Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-[1200px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-12 md:p-24 rounded-[4rem] bg-zinc-950 border border-white/5 relative overflow-hidden text-center"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                        <div className="relative z-10">
                            <Target className="w-16 h-16 text-blue-500 mx-auto mb-10 opacity-50" />
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight">
                                &quot;Our vision is a world where medical emergencies never lack critical data, and clinical research is powered by consensual, verified participation.&quot;
                            </h2>
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8" />
                            <p className="text-gray-500 uppercase tracking-[0.3em] font-black text-xs">
                                The HealthChain Manifesto
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Values Grid */}
            <section className="py-32 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Immutable Trust",
                                desc: "Every record is anchored to the Polygon blockchain, creating a permanent, audit-ready history that can't be tampered with.",
                                color: "text-blue-400",
                                border: "border-blue-500/10"
                            },
                            {
                                icon: Globe,
                                title: "Borderless Care",
                                desc: "Your health records travel with you globally. Access specialized care anywhere without the friction of paperwork.",
                                color: "text-emerald-400",
                                border: "border-emerald-500/10"
                            },
                            {
                                icon: Heart,
                                title: "Patient Dignity",
                                desc: "We prioritize patient autonomy. You own the keys. You grant the access. You are the center of your clinical story.",
                                color: "text-red-400",
                                border: "border-red-500/10"
                            },
                            {
                                icon: Users,
                                title: "Clinical Unity",
                                desc: "Bridging the gap between doctors, hospitals, and pharmacies through a unified, secure data layer.",
                                color: "text-purple-400",
                                border: "border-purple-500/10"
                            },
                            {
                                icon: Award,
                                title: "Standards-Based",
                                desc: "Built on FHIR and HL7 standards ensuring interoperability with existing legacy healthcare systems.",
                                color: "text-amber-400",
                                border: "border-amber-500/10"
                            },
                            {
                                icon: Workflow,
                                title: "Agile Integration",
                                desc: "Scalable API infrastructure designed for modern hospitals and emerging health-tech startups.",
                                color: "text-cyan-400",
                                border: "border-cyan-500/10"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 rounded-[2.5rem] bg-zinc-950/50 border ${item.border} hover:bg-zinc-900 transition-all group`}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team/Impact Section Mockup */}
            <section className="py-32 px-6 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent overflow-hidden">
                <div className="max-w-[1200px] mx-auto text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-12 relative z-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                            Impact. <span className="text-blue-500">Not just code.</span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto">
                            {[
                                { number: "50k+", label: "Verified Patients" },
                                { number: "120+", label: "Partner Hospitals" },
                                { number: "10M+", label: "Records Secured" },
                                { number: "0", label: "Data Breaches" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <p className="text-4xl md:text-5xl font-black text-white">{stat.number}</p>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Journey Timeline CTA */}
            <section className="py-24 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
                >
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            The journey to <br />
                            <span className="text-blue-500">Universal Access.</span>
                        </h2>
                        <p className="text-xl text-gray-400 leading-relaxed font-medium">
                            HealthChain started with a simple question: Why is medical data still stuck in the 90s?
                            Since then, we&apos;ve been on a mission to protocolize healthcare data for the 21st century.
                        </p>
                        <Link href="/careers">
                            <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold bg-white text-black hover:bg-zinc-200 transition-all group">
                                Join Our Team
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {/* Visual Element: Stylized Medical Logo or Iconography */}
                    <div className="relative aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[4rem] animate-pulse" />
                        <div className="absolute inset-4 bg-zinc-950 border border-white/10 rounded-[3rem] flex items-center justify-center overflow-hidden">
                            <Activity className="w-48 h-48 text-blue-500 animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Final CTA Footer */}
            <section className="py-32 px-6 text-center border-t border-white/5">
                <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                        Driven by <br />
                        <span className="italic font-serif text-zinc-600">innovation.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/signup">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-12 h-16 text-xl font-black shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-12 h-16 text-xl font-black">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
