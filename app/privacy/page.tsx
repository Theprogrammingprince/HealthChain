'use client';

import { Shield, Lock, Eye, UserCheck, Server, FileText, ChevronRight, Gavel, Cpu, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
    {
        icon: Lock,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        title: "Sovereign Ownership",
        subtitle: "The Encryption Protocol",
        content: "Data anchored to the HealthChain protocol is encrypted client-side using industry-leading AES-256 standards. Your private key is the only mechanism for decryption. Even at the node level, your data remains an opaque, unreadable blob."
    },
    {
        icon: Eye,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        title: "On-Chain Audit Trails",
        subtitle: "Immutable Provenance",
        content: "Every access request, grant, and revocation is recorded as a cryptographic proof on the Polygon blockchain. This creates a permanent, tamper-proof record of every clinical interaction without ever exposing medical content."
    },
    {
        icon: UserCheck,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        title: "Consent Architecture",
        subtitle: "Granular Access Control",
        content: "No third party—not even HealthChain—can access your record without a valid, signed smart contract permission. You maintain the absolute right to revoke provider access instantly, globally, and permanently."
    },
    {
        icon: Server,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        title: "Decentralized Persistence",
        subtitle: "IPFS Node Network",
        content: "Medical payloads are sharded and distributed across a global IPFS network. This eliminates central points of failure and prevents mass-data exposure incidents common in legacy centralized EHR systems."
    },
    {
        icon: Globe,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/20",
        title: "Regulatory Alignment",
        subtitle: "Global Compliance Nodes",
        content: "HealthChain is engineered to exceed HIPAA and GDPR requirements by automating compliance through code. Our self-sovereign identity model aligns with the highest international standards of data protection."
    }
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Massive Atmospheric Header */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-[1400px] mx-auto text-center space-y-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Shield className="w-3 h-3" />
                        <span>Security Directive 2026.1</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase italic font-serif">
                        Privacy <br /> <span className="text-blue-600 not-italic font-sans">Protocol.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        At HealthChain, privacy is not a policy — it is the fundamental logic of our clinical network.
                    </p>
                </motion.div>
            </section>

            {/* Content Architecture */}
            <section className="py-32 px-6">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Sidebar Info */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="sticky top-32 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 border-l-2 border-blue-600 pl-6">Core Principles</h3>
                            <div className="space-y-6">
                                {[
                                    { label: "Identity", val: "Self-Sovereign" },
                                    { label: "Storage", val: "Decentralized" },
                                    { label: "Access", val: "Patient-Signed" }
                                ].map((stat, i) => (
                                    <div key={i} className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{stat.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-4">
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    Our privacy architecture is designed for military-grade persistence and total patient sovereignty. Read the technical documentation for further cryptographical details.
                                </p>
                                <Button variant="link" className="text-blue-400 p-0 h-auto font-black uppercase tracking-widest text-[10px]">
                                    Download Encryption spec &rarr;
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="lg:col-span-8 space-y-6">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-10 rounded-[3rem] bg-zinc-950/50 border ${section.borderColor} hover:bg-zinc-900 transition-all duration-700 group relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-blue-500/5 transition-colors" />

                                <div className="flex flex-col md:flex-row items-start gap-8">
                                    <div className={`p-5 rounded-2xl ${section.bgColor} group-hover:scale-110 transition-transform duration-500`}>
                                        <section.icon className={`w-8 h-8 ${section.color}`} />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{section.subtitle}</p>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                                {section.title}
                                            </h2>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed text-lg font-medium">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Protocol Governance Footer */}
            <section className="py-32 px-6 bg-zinc-950 relative overflow-hidden">
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-[1400px] mx-auto bg-black border border-white/5 rounded-[4rem] p-20 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent" />

                    <div className="relative z-10 space-y-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <Gavel className="w-3 h-3 text-blue-500" />
                            <span>Standardized Governance v2.4</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                            Your Data. <br />Your <span className="text-blue-600">Sovereign Right.</span>
                        </h2>

                        <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Initialize your secure clinical profile today and join thousands of patients regaining control of their medical history.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link href="/signup">
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-12 h-20 text-xl font-black uppercase tracking-widest shadow-3xl shadow-blue-600/30 transition-all group">
                                    Join Network
                                    <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/terms">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-10 h-20 text-lg font-bold uppercase tracking-widest">
                                    Network Terms
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-20 text-center space-y-4">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        Last Consensus: January 2026 • Build ID: HC-PROT-AX9
                    </p>
                    <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase text-gray-800 tracking-widest">
                        <div className="flex items-center gap-2"><Cpu className="w-3 h-3" /> <span>On-Chain Verified</span></div>
                        <div className="flex items-center gap-2"><Lock className="w-3 h-3" /> <span>AES-256 Validated</span></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
