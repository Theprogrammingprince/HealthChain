'use client';

import { ScrollText, AlertTriangle, Shield, Zap, Scale, FileWarning, ChevronRight, Info, BookOpen, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
    {
        icon: AlertTriangle,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        title: "Protocol Liability",
        subtitle: "Limitation of Risk",
        content: "HealthChain is an autonomous software interface. We do not control the Polygon blockchain or IPFS. We are not responsible for loss of private keys, failed transactions, or medical outcomes as a result of data usage. All users accept the inherent risks of decentralized networks."
    },
    {
        icon: Zap,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        title: "Immutable Finality",
        subtitle: "On-Chain Permanence",
        content: "Every transaction committed to the network—including data anchorings and access grants—is final and irreversible. Ensure all clinical identifiers and wallet addresses are validated prior to execution."
    },
    {
        icon: FileWarning,
        color: "text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20",
        title: "Network Status",
        subtitle: "Beta Infrastructure",
        content: "The protocol is currently in Mainnet Beta. While engineered for mission-critical stability, users should maintain external backups of vital health directives. We do not guarantee 100% network uptime or zero-latency across all global nodes."
    },
    {
        icon: Fingerprint,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        title: "Sovereign Obligation",
        subtitle: "Key Management",
        content: "Your private key is your only passport to your data. HealthChain cannot recover lost keys or reverse unauthorized access grants. We provide the tools; you provide the vigilance."
    },
    {
        icon: Scale,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        title: "Governance Model",
        subtitle: "Binding Resolution",
        content: "Usage of the protocol constitutes agreement to decentralized arbitration for any systemic disputes. These terms are governed by the consensus of the HealthChain Foundation and applicable international law."
    }
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Massive Atmospheric Header */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-[1400px] mx-auto text-center space-y-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <ScrollText className="w-3 h-3" />
                        <span>Consensus Contract v2.4</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase italic font-serif">
                        Network <br /> <span className="text-purple-600 not-italic font-sans">Terms.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Binding agreements for the HealthChain decentralized clinical coordination network.
                    </p>
                </motion.div>
            </section>

            {/* Critical Warning Banner */}
            <section className="py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                            <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-amber-500 uppercase tracking-tight">Critical Disclosure</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Please review these parameters with extreme precision. Accessing or interacting with HealthChain constructs constitutes an unconditional agreement to these protocol standards.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Main Content Architecture */}
            <section className="py-24 px-6">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Sidebar Table of Contents */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="sticky top-32 space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 border-l-2 border-purple-600 pl-6">Legal Framework</h3>
                                <div className="space-y-4">
                                    {sections.map((section, i) => (
                                        <div key={i} className="flex items-center gap-4 text-gray-600 group cursor-pointer hover:text-white transition-colors">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Sec {i + 1}</span>
                                            <span className="text-sm font-bold uppercase tracking-tight">{section.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">Protocol Resources</span>
                                </div>
                                <div className="grid gap-3">
                                    <Button variant="outline" className="justify-between border-white/5 bg-white/[0.02] hover:bg-white/5 p-6 rounded-2xl group">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Whitepaper</span>
                                        <ChevronRight className="w-4 h-4 text-purple-500" />
                                    </Button>
                                    <Button variant="outline" className="justify-between border-white/5 bg-white/[0.02] hover:bg-white/5 p-6 rounded-2xl group">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Audit Report</span>
                                        <ChevronRight className="w-4 h-4 text-purple-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Clauses */}
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
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

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

            {/* Support Coordination Footer */}
            <section className="py-32 px-6 bg-zinc-950 relative overflow-hidden">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-[1400px] mx-auto bg-black border border-white/5 rounded-[4rem] p-24 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-transparent" />

                    <div className="relative z-10 space-y-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <Info className="w-3 h-3 text-purple-500" />
                            <span>Legal Support Node active</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                            Legal Clarification <br /> <span className="text-purple-600">Request.</span>
                        </h2>

                        <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            For inquiries regarding the protocol’s consensus model or operational governance, please contact our legal coordination team.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link href="/contact">
                                <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-2xl px-12 h-20 text-xl font-black uppercase tracking-widest shadow-3xl shadow-purple-600/30 transition-all group">
                                    Contact Support
                                    <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/privacy">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-10 h-20 text-lg font-bold uppercase tracking-widest">
                                    Privacy Hub
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-20 text-center space-y-6">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        Standard Release Jan 2026 • Build ID: TERM-CONS-01
                    </p>
                    <div className="flex items-center justify-center gap-8 text-[9px] font-black uppercase text-gray-800 tracking-widest">
                        <div className="flex items-center gap-2"><Scale className="w-3 h-3" /> <span>Unified Jurisdiction</span></div>
                        <div className="flex items-center gap-2"><Shield className="w-3 h-3" /> <span>Protocol Protected</span></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
