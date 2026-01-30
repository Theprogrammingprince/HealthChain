"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LifeBuoy,
    Book,
    MessageSquare,
    Mail,
    Search,
    ChevronDown,
    ExternalLink,
    Shield,
    FileText,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const faqs = [
    {
        question: "How do I access my medical records in an emergency?",
        answer: "Every HealthChain user is assigned a unique Emergency Access ID. In an emergency, first responders can enter this ID on our Emergency Portal to gain temporary, audited access to your critical data (allergies, blood type, etc.) without needing your private key."
    },
    {
        question: "Is my data actually stored on the blockchain?",
        answer: "Your clinical data is stored in encrypted shards on IPFS (InterPlanetary File System). Only the IPFS hashes and metadata (like approval status and timestamps) are stored on the Polygon blockchain to ensure tamper-proof integrity."
    },
    {
        question: "How can I revoke access for a doctor?",
        answer: "Go to your Patient Dashboard, navigate to 'Record Access' or 'Permissions', and you can instantly revoke access for any individual practitioner or hospital. This takes effect immediately on-chain."
    },
    {
        question: "I lost my recovery phrase, what should I do?",
        answer: "Since HealthChain is decentralized, we do not store your recovery phrase. If you lose it, we cannot recover your account. We strongly recommend keeping multiple physical backups in secure locations."
    },
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Support ticket created!", {
                description: "Our dedicated team will review your request and get back to you via email within 24 hours."
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-blue-500/30 font-sans">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <main className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6"
                        >
                            <LifeBuoy className="w-4 h-4" />
                            HealthChain Support Hub
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6"
                        >
                            How can we <span className="text-blue-500">help you?</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-500 text-lg max-w-2xl mx-auto"
                        >
                            Search our clinical knowledge base, explore frequently asked questions, or connect with our support protocol specialists.
                        </motion.p>
                    </div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto mb-20 relative"
                    >
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-400 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Search the documentation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 text-lg focus:border-blue-500 focus:ring-blue-500/20 transition-all placeholder:text-gray-600 shadow-2xl"
                            />
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Help Categories */}
                        <div className="lg:col-span-2 space-y-10">
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Clinical Knowledge Base</h2>
                                    <Button variant="ghost" className="text-blue-500 hover:bg-blue-500/10 uppercase tracking-widest text-[10px] font-black">
                                        View All Docs <ArrowRight className="w-3 h-3 ml-2" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { title: "Getting Started", desc: "Setting up your digital identity and wallet.", icon: Book, color: "text-blue-400" },
                                        { title: "On-Chain Privacy", desc: "Understanding the Guardian protocol encryption.", icon: Shield, color: "text-emerald-400" },
                                        { title: "Record Management", desc: "How to upload, verify, and approve records.", icon: FileText, color: "text-purple-400" },
                                        { title: "Emergency Protocols", desc: "Managing your emergency access IDs.", icon: LifeBuoy, color: "text-red-400" },
                                    ].map((cat, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                            className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl cursor-pointer group transition-all"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors`}>
                                                <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                            </div>
                                            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{cat.title}</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Protocol FAQs</h2>
                                <div className="space-y-4">
                                    {filteredFaqs.map((faq, i) => (
                                        <div
                                            key={i}
                                            className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all"
                                        >
                                            <button
                                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                                            >
                                                <span className="font-bold text-white uppercase tracking-tight text-sm">{faq.question}</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {openFaq === i && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="px-6 pb-6"
                                                    >
                                                        <div className="pt-2 text-gray-400 text-sm leading-relaxed border-t border-white/5">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                    {filteredFaqs.length === 0 && (
                                        <div className="text-center py-10 text-gray-600 italic">No matching results found...</div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white/5 border-white/10 rounded-3xl sticky top-32 backdrop-blur-sm overflow-hidden border-t-2 border-t-blue-500/50 shadow-2xl">
                                <CardHeader className="p-8 border-b border-white/5">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                                        <MessageSquare className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Open a Ticket</CardTitle>
                                    <CardDescription className="text-gray-500 font-medium italic mt-2">
                                        Can't find what you need? Reach out to our human operators.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Subject</label>
                                            <Input
                                                required
                                                placeholder="e.g. Account Recovery"
                                                className="bg-white/5 border-white/10 h-12 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Email Address</label>
                                            <Input
                                                required
                                                type="email"
                                                placeholder="your@email.com"
                                                className="bg-white/5 border-white/10 h-12 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Detailed Message</label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Describe the clinical issue..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500 outline-none transition-all resize-none"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Broadcasting...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Submit Request
                                                </div>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>Typical Response: <strong className="text-gray-300">&lt; 12 hours</strong></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>24/7 Security Hotline Available</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
