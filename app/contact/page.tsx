'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, MessageSquare, Send, ChevronRight, Globe, Clock, Sparkles, Building2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Massive Atmospheric Header */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-[1400px] mx-auto text-center space-y-8"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <MessageSquare className="w-3 h-3" />
                        <span>Communication Hub</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase italic font-serif">
                        Open <br /> <span className="text-blue-600 not-italic font-sans">Channels.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Initialize a connection with the HealthChain coordination team for enterprise integration or clinical support.
                    </p>
                </motion.div>
            </section>

            <main className="max-w-[1400px] mx-auto px-6 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                    {/* Left Column: Contact Info Architecture */}
                    <div className="lg:col-span-5 space-y-16">
                        <div className="space-y-8">
                            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                Protocol <br /> Information.
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed font-medium max-w-md">
                                Join the decentralized healthcare revolution. Our coordination nodes are global and operate across all time zones.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                {
                                    icon: Mail,
                                    title: "Clinical Exchange",
                                    details: ["support@healthchain.app", "partners@healthchain.app"],
                                    color: "text-blue-400",
                                    bgColor: "bg-blue-500/10"
                                },
                                {
                                    icon: Building2,
                                    title: "Operations Base",
                                    details: ["123 Blockchain Ave, Suite 500", "San Francisco, CA 94103"],
                                    color: "text-purple-400",
                                    bgColor: "bg-purple-500/10"
                                },
                                {
                                    icon: Globe,
                                    title: "Network Nodes",
                                    details: ["24/7 Global Coverage", "Multilingual Support"],
                                    color: "text-emerald-400",
                                    bgColor: "bg-emerald-500/10"
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group flex items-start gap-8 p-8 rounded-[2.5rem] bg-zinc-950/50 border border-white/5 hover:border-blue-500/20 hover:bg-zinc-900 transition-all duration-700"
                                >
                                    <div className={`p-5 rounded-2xl ${item.bgColor} group-hover:scale-110 transition-transform duration-500`}>
                                        <item.icon className={`w-8 h-8 ${item.color}`} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-black text-white text-xl uppercase tracking-tight">{item.title}</h3>
                                        <div className="space-y-1">
                                            {item.details.map((line, j) => (
                                                <p key={j} className="text-gray-500 leading-relaxed font-medium">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Transmission Form Architecture */}
                    <div className="lg:col-span-7 relative group">
                        <div className="absolute -inset-4 bg-blue-600/5 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-zinc-950 border border-white/5 rounded-[3.5rem] p-12 md:p-16 overflow-hidden shadow-3xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

                            <form className="space-y-10 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">First Instance</label>
                                            <Input
                                                placeholder="John"
                                                className="bg-white/[0.02] border-white/5 focus:border-blue-500/30 h-16 rounded-2xl px-8 text-white font-bold placeholder:text-gray-800 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">Last Instance</label>
                                            <Input
                                                placeholder="Doe"
                                                className="bg-white/[0.02] border-white/5 focus:border-blue-500/30 h-16 rounded-2xl px-8 text-white font-bold placeholder:text-gray-800 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">Network Address (Email)</label>
                                        <Input
                                            placeholder="john@healthchain.app"
                                            type="email"
                                            className="bg-white/[0.02] border-white/5 focus:border-blue-500/30 h-16 rounded-2xl px-8 text-white font-bold placeholder:text-gray-800 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">Inquiry Payload Type</label>
                                        <div className="relative">
                                            <select className="flex h-16 w-full rounded-2xl border border-white/5 bg-white/[0.02] px-8 py-2 text-white font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all appearance-none cursor-pointer">
                                                <option className="bg-zinc-950 text-white" value="general">General Transmission</option>
                                                <option className="bg-zinc-950 text-white" value="partnership">Clinical Node Partnership</option>
                                                <option className="bg-zinc-950 text-white" value="support">Patient Recovery Support</option>
                                                <option className="bg-zinc-950 text-white" value="media">Media & Global Press</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                                <ChevronRight className="w-5 h-5 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">Interaction Details</label>
                                        <Textarea
                                            placeholder="Describe your clinical or technical requirements..."
                                            className="min-h-[200px] bg-white/[0.02] border-white/5 focus:border-blue-500/30 rounded-3xl px-8 py-6 text-white font-bold placeholder:text-gray-800 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-24 rounded-2xl font-black uppercase tracking-widest text-xl shadow-3xl shadow-blue-600/30 transition-all group overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-4">
                                        Transmit Message
                                        <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                    </span>
                                </Button>

                                <div className="flex items-center justify-center gap-3 text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                    <Zap className="w-3 h-3 text-blue-500" />
                                    <span>Encrypted Transmission Enabled</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Distribution Visualization */}
            <section className="py-32 bg-zinc-950/20 backdrop-blur-3xl border-y border-white/5">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-24 space-y-6">
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Global <span className="text-blue-500">Nodes.</span></h2>
                        <p className="text-gray-500 text-lg font-medium">Active support coordination centers across the protocol.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { city: "San Francisco", region: "Americas", status: "Active" },
                            { city: "London", region: "Europe", status: "Active" },
                            { city: "Singapore", region: "Asia Pacific", status: "Active" },
                            { city: "Lagos", region: "Africa", status: "Active" }
                        ].map((node, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] bg-black border border-white/5 text-center group hover:border-blue-500/20 transition-all"
                            >
                                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-6 shadow-3xl shadow-blue-500/50 animate-pulse" />
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{node.city}</h4>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">{node.region}</p>
                                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-blue-500/50 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    <span>24/7 Operational</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
