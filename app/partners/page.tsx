'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Globe2, ShieldCheck, Stethoscope, ArrowRight, CheckCircle2, Loader2, Sparkles, Building2, ChevronRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function PartnersPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Application Submitted", {
            description: "Thank you for your interest. Our partnership team will contact you shortly."
        });
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

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
                        <Handshake className="w-4 h-4" />
                        <span>Global Ecosystem</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 bg-gradient-to-b from-white via-white/90 to-zinc-700 bg-clip-text text-transparent leading-[1.1]">
                        Healing the world, <br />
                        <span className="text-blue-500 italic font-serif">one partner at a time.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
                        Join the decentralized network of hospitals, research labs, and clinics rebuilding healthcare trust.
                    </p>
                </motion.div>
            </section>

            {/* Core Benefits */}
            <section className="py-24 px-6 relative">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Enterprise Trust",
                            desc: "HIPAA-compliant infrastructure with sovereign encryption keys.",
                            color: "text-emerald-400",
                            bgColor: "bg-emerald-500/10"
                        },
                        {
                            icon: Globe2,
                            title: "Global Interop",
                            desc: "Seamless record transfer across borders using standard protocols.",
                            color: "text-blue-400",
                            bgColor: "bg-blue-500/10"
                        },
                        {
                            icon: Stethoscope,
                            title: "Clinical Edge",
                            desc: "Real-time access to longitudinal data for precision medicine.",
                            color: "text-purple-400",
                            bgColor: "bg-purple-500/10"
                        }
                    ].map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[2.5rem] bg-zinc-950/50 border border-white/5 hover:bg-zinc-900 hover:border-blue-500/30 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`w-16 h-16 rounded-2xl ${benefit.bgColor} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                {benefit.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Partnership Tiers / Stats Overlay */}
            <section className="py-24 px-6 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                Integrated by <br />
                                <span className="text-blue-500">Industry Leaders.</span>
                            </h2>
                            <p className="text-xl text-gray-400 font-medium">
                                We're not just a platform; we're a protocol. Connect your legacy EMR system to the future in weeks, not years.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { icon: Zap, label: "API-First Access" },
                                { icon: Building2, label: "Hospital Nodes" },
                                { icon: Target, label: "Custom Integration" },
                                { icon: Sparkles, label: "Pilot Program" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                                    <item.icon className="w-5 h-5 text-blue-500" />
                                    <span className="font-bold text-white uppercase tracking-widest text-[10px]">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[3rem] overflow-hidden border border-white/10 aspect-video bg-zinc-950 flex items-center justify-center p-12"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full animate-pulse" />
                        <div className="text-center space-y-6 relative z-10">
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">Network Health</p>
                            <p className="text-6xl md:text-8xl font-black text-white">99.99%</p>
                            <p className="text-gray-500 font-medium uppercase tracking-widest">Global Uptime Agreement</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Application Section */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-start">
                    <div className="flex-1 space-y-8 sticky top-32">
                        <h2 className="text-4xl md:text-6xl font-black text-white">Join the Protocol.</h2>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium">
                            Submit your organization's credentials to begin the verification process. Our clinical board reviews all applications within 72 hours.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                "Early access to decentralized identity tools",
                                "Dedicated integration engineering team",
                                "Co-marketing with HealthChain network",
                                "Revenue sharing for clinical data exchange"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="p-1 rounded-full bg-blue-500/20">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="text-gray-300 font-medium">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full"
                    >
                        <div className="bg-zinc-950 border border-white/10 p-10 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Contact Name</Label>
                                        <Input className="bg-white/[0.03] border-white/5 h-14 rounded-xl px-6 focus:border-blue-500 transition-all" placeholder="Sarah Jenkins" required />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Work Email</Label>
                                        <Input className="bg-white/[0.03] border-white/5 h-14 rounded-xl px-6 focus:border-blue-500 transition-all" type="email" placeholder="sarah@clinic.io" required />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Organization Name</Label>
                                    <Input className="bg-white/[0.03] border-white/5 h-14 rounded-xl px-6 focus:border-blue-500 transition-all" placeholder="St. Lukes Medical Center" required />
                                </div>

                                <div className="space-y-3">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Organization Type</Label>
                                    <Select>
                                        <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-xl px-6 focus:border-blue-500 transition-all">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="hospital">Hospital / Medical Center</SelectItem>
                                            <SelectItem value="clinic">Private Clinic</SelectItem>
                                            <SelectItem value="pharmacy">Pharmacy</SelectItem>
                                            <SelectItem value="lab">Diagnostic Lab</SelectItem>
                                            <SelectItem value="tech">HealthTech Vendor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Message</Label>
                                    <Textarea
                                        className="bg-white/[0.03] border-white/5 min-h-[160px] rounded-2xl px-6 py-4 focus:border-blue-500 transition-all resize-none"
                                        placeholder="Tell us about your organization and preferred integration path..."
                                    />
                                </div>

                                <Button
                                    className="w-full h-16 text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all group"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Encrypting...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            Apply for Access
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
