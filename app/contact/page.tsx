'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, MessageSquare, Send, ChevronRight, Globe, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 uppercase tracking-widest"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Get In Touch</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        Let&apos;s build the future <br />
                        <span className="text-blue-500 italic font-serif">of healthcare together.</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Have questions about enterprise integration, security, or need clinical support? Our team is ready to assist you.
                    </p>
                </motion.div>
            </section>

            <main className="max-w-[1200px] mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Column: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-white">Contact Information</h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Join the decentralized healthcare revolution. We &apos;re here to answer any questions you may have.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                {
                                    icon: Mail,
                                    title: "Email Us",
                                    details: ["support@healthchain.app", "partners@healthchain.app"],
                                    color: "text-blue-400",
                                    bgColor: "bg-blue-500/10"
                                },
                                {
                                    icon: Phone,
                                    title: "Call Us",
                                    details: ["+1 (555) 000-HEALTH", "Mon-Fri, 9am - 6pm EST"],
                                    color: "text-emerald-400",
                                    bgColor: "bg-emerald-500/10"
                                },
                                {
                                    icon: MapPin,
                                    title: "Headquarters",
                                    details: ["123 Blockchain Ave, Suite 500", "San Francisco, CA 94103"],
                                    color: "text-purple-400",
                                    bgColor: "bg-purple-500/10"
                                },
                                {
                                    icon: Globe,
                                    title: "Global Support",
                                    details: ["24/7 Emergency Coverage", "Multilingual Assistance"],
                                    color: "text-cyan-400",
                                    bgColor: "bg-cyan-500/10"
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="group flex items-start gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                >
                                    <div className={`p-4 rounded-2xl ${item.bgColor} group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                                        {item.details.map((line, j) => (
                                            <p key={j} className="text-gray-400 leading-relaxed font-medium">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[2.5rem] blur opacity-20" />
                        <div className="relative bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

                            <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-black uppercase tracking-widest text-gray-500">First Name</label>
                                            <Input
                                                placeholder="John"
                                                className="bg-white/[0.03] border-white/5 focus:border-blue-500/50 h-14 rounded-xl px-6 text-white placeholder:text-gray-700 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black uppercase tracking-widest text-gray-500">Last Name</label>
                                            <Input
                                                placeholder="Doe"
                                                className="bg-white/[0.03] border-white/5 focus:border-blue-500/50 h-14 rounded-xl px-6 text-white placeholder:text-gray-700 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">Email Address</label>
                                        <Input
                                            placeholder="john@healthchain.app"
                                            type="email"
                                            className="bg-white/[0.03] border-white/5 focus:border-blue-500/50 h-14 rounded-xl px-6 text-white placeholder:text-gray-700 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">Subject</label>
                                        <select className="flex h-14 w-full rounded-xl border border-white/5 bg-white/[0.03] px-6 py-2 text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none cursor-pointer">
                                            <option className="bg-zinc-950 text-white" value="general">General Inquiry</option>
                                            <option className="bg-zinc-950 text-white" value="partnership">Clinical Partnership</option>
                                            <option className="bg-zinc-950 text-white" value="support">Patient Support</option>
                                            <option className="bg-zinc-950 text-white" value="media">Media & Press</option>
                                            <option className="bg-zinc-950 text-white" value="careers">Careers</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">Message</label>
                                        <Textarea
                                            placeholder="How can we help you revolutionize your healthcare experience?"
                                            className="min-h-[160px] bg-white/[0.03] border-white/5 focus:border-blue-500/50 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-16 rounded-2xl font-bold text-lg shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] transition-all group">
                                    Send Message
                                    <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>

                                <p className="text-center text-xs text-gray-600 font-medium">
                                    By submitting this form, you agree to our
                                    <Link href="/privacy" className="text-blue-500 hover:text-blue-400 underline underline-offset-4 ml-1">Privacy Policy</Link>
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Global Presence Section */}
            <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent">
                <div className="max-w-[1200px] mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-8">
                            Global Presence, <br />
                            <span className="text-emerald-500">Localized Support.</span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { city: "New York", country: "Americas", time: "EST" },
                                { city: "London", country: "Europe", time: "GMT" },
                                { city: "Singapore", country: "Asia Pacific", time: "SGT" },
                                { city: "Lagos", country: "Africa", time: "WAT" }
                            ].map((office, i) => (
                                <div key={i} className="space-y-2">
                                    <p className="text-white font-bold text-lg">{office.city}</p>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">{office.country}</p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 font-mono">
                                        <Clock className="w-3 h-3" />
                                        <span>{office.time} Coverage</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ CTA */}
            <section className="py-20 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-16 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Check our Frequently <br /> Asked Questions
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                        Find instant answers to common questions about security, integration, and patient data management.
                    </p>
                    <Link href="/faq">
                        <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-10 h-16 text-lg font-black shadow-xl transition-all group">
                            Visit Help Center
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
