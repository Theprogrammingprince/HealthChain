'use client';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Code, Layout, Palette, Megaphone, Terminal } from "lucide-react";

const jobs = [
    {
        title: "Senior Smart Contract Engineer",
        meta: "Remote • Engineering • Full-time",
        icon: Terminal,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10"
    },
    {
        title: "Full Stack Developer (Next.js)",
        meta: "Remote • Engineering • Full-time",
        icon: Code,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10"
    },
    {
        title: "Blockchain Security Auditor",
        meta: "Remote • Engineering • Full-time",
        icon: Briefcase,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10"
    },
    {
        title: "Product Designer",
        meta: "New York / Remote • Design • Full-time",
        icon: Palette,
        color: "text-pink-400",
        bgColor: "bg-pink-500/10"
    },
    {
        title: "Growth Marketing Lead",
        meta: "Remote • Marketing • Full-time",
        icon: Megaphone,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10"
    }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-4xl mx-auto text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black uppercase tracking-widest mb-8"
                    >
                        <Briefcase className="w-4 h-4" />
                        <span>Work with Us</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-zinc-600 bg-clip-text text-transparent">
                        Build the protocol <br />
                        <span className="text-blue-500 italic font-serif">for human health.</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Join a remote-first team of engineers, designers, and healthcare experts rebuilding the infrastructure of clinical data.
                    </p>
                </motion.div>
            </section>

            {/* Jobs List */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Open Positions</h2>
                        <p className="text-gray-500 font-medium">{jobs.length} roles available</p>
                    </div>

                    <div className="grid gap-4">
                        {jobs.map((job, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="group p-8 rounded-3xl bg-zinc-950/50 border border-white/5 hover:bg-zinc-900 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

                                <div className="flex items-center gap-6 relative z-10">
                                    <div className={`p-4 rounded-2xl ${job.bgColor} group-hover:scale-110 transition-transform`}>
                                        <job.icon className={`w-8 h-8 ${job.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.meta.split('•')[0].trim()}</span>
                                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.meta.split('•')[1].trim()}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.meta.split('•')[2].trim()}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 font-bold relative z-10 shrink-0">
                                    Apply Now
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 px-6 bg-zinc-950/50 border-y border-white/5">
                <div className="max-w-[1200px] mx-auto text-center space-y-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Why HealthChain?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Remote-First",
                                desc: "Work from anywhere in the world. We believe talent is global and geography is optional.",
                                icon: Globe
                            },
                            {
                                title: "Equity & Ownership",
                                desc: "Every team member gets equity. We're all owners building the future of healthcare.",
                                icon: Sparkles
                            },
                            {
                                title: "Health & Wellness",
                                desc: "Comprehensive health coverage and wellness stipends. Your own health is our priority.",
                                icon: Briefcase
                            }
                        ].map((benefit, i) => (
                            <div key={i} className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                    <benefit.icon className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
                                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* General Inquiry Footer */}
            <section className="py-24 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <h2 className="text-3xl font-bold text-white">Don&apos;t see a role for you?</h2>
                    <p className="text-gray-400 text-lg">
                        We are always looking for visionary talent. Send us your resume and tell us how you can help.
                    </p>
                    <Link href="/contact">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-12 h-14 text-lg font-bold">
                            Email your CV
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
