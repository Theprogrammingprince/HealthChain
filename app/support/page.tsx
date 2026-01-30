'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LifeBuoy,
    Book,
    MessageSquare,
    Mail,
    Search,
    ChevronDown,
    Shield,
    FileText,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Clock,
    Phone,
    HelpCircle,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const faqs = [
    {
        question: "How do I access my medical records in an emergency?",
        answer: "Every HealthChain user is assigned a unique Emergency Access ID. In an emergency, first responders can enter this ID on our Emergency Portal to gain temporary, audited access to your critical data (allergies, blood type, etc.) without needing your private key."
    },
    {
        question: "Is my data actually stored on the blockchain?",
        answer: "Your clinical data is stored in encrypted shards on IPFS. Only the IPFS hashes and metadata (like approval status and timestamps) are stored on the Polygon blockchain to ensure tamper-proof integrity."
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
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

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
                        <LifeBuoy className="w-4 h-4" />
                        <span>Support Portal</span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 bg-gradient-to-b from-white via-white/90 to-zinc-700 bg-clip-text text-transparent leading-[1.1]">
                        Here to help <br />
                        <span className="text-blue-500 italic font-serif">when you need us.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
                        Search our knowledge base or connect with a support specialist. We&apos;re committed to your clinical success.
                    </p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search questions or articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 bg-white/5 border-white/10 rounded-2xl text-lg focus:border-blue-500 transition-all font-medium"
                        />
                    </motion.div>
                </motion.div>
            </section>

            <main className="max-w-[1400px] mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

                    {/* Left Column: Knowledge Base */}
                    <div className="lg:col-span-2 space-y-20">
                        {/* Categories */}
                        <section className="space-y-10">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Help Categories</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: "Getting Started", desc: "Setting up your digital identity and wallet.", icon: Book, color: "text-blue-400" },
                                    { title: "Privacy & Security", desc: "Encryption standards and access control.", icon: Shield, color: "text-emerald-400" },
                                    { title: "Record Management", desc: "Uploading and verifying medical records.", icon: FileText, color: "text-purple-400" },
                                    { title: "Emergency System", desc: "Using your Emergency Access ID.", icon: LifeBuoy, color: "text-red-400" }
                                ].map((cat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-8 rounded-[2rem] bg-zinc-950/50 border border-white/5 hover:bg-zinc-900 hover:border-blue-500/30 transition-all group cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <cat.icon className={`w-7 h-7 ${cat.color}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{cat.title}</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed">{cat.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* FAQs */}
                        <section className="space-y-10">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Top Questions</h2>
                            <div className="space-y-4">
                                {filteredFaqs.map((faq, i) => (
                                    <div key={i} className="rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-8 text-left hover:bg-white/[0.02] transition-colors"
                                        >
                                            <span className="text-xl font-bold text-white">{faq.question}</span>
                                            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openFaq === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-8 pb-8"
                                                >
                                                    <div className="h-px bg-white/5 mb-6" />
                                                    <p className="text-gray-400 text-lg leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Support Ticket */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-950 border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden sticky top-32">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                                        <MessageSquare className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Open a Ticket</h3>
                                    <p className="text-gray-500 font-medium">Our helpdesk protocol is active and ready.</p>
                                </div>

                                <form onSubmit={handleSubmitTicket} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Subject</label>
                                        <Input className="bg-white/[0.03] border-white/5 h-14 rounded-xl px-4 focus:border-blue-500 transition-all" required placeholder="Describe your issue" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Email</label>
                                        <Input className="bg-white/[0.03] border-white/5 h-14 rounded-xl px-4 focus:border-blue-500 transition-all" type="email" required placeholder="you@domain.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="uppercase tracking-widest text-[10px] font-black text-gray-500 ml-1">Message</label>
                                        <textarea className="w-full bg-white/[0.03] border border-white/5 h-32 rounded-xl p-4 focus:border-blue-500 transition-all resize-none outline-none text-white" required placeholder="How can we assist you today?" />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all group"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Broadcasting...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Submit Ticket
                                            </div>
                                        )}
                                    </Button>
                                </form>

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3 text-emerald-500" />
                                        <span>Typical Response: 12h</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                        <Phone className="w-3 h-3 text-emerald-500" />
                                        <span>24/7 Priority Support</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Final CTA */}
            <section className="pb-32 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-indigo-600 to-blue-700 p-12 md:p-20 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2" />
                    <Sparkles className="w-12 h-12 text-white/50 mx-auto mb-8 animate-pulse" />
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Need deep documentation?</h2>
                    <p className="text-indigo-100 text-lg mb-12 max-w-xl mx-auto font-medium">
                        Explore our high-level architectural overviews and API documentation for detailed clinical implementations.
                    </p>
                    <Link href="/documentation">
                        <Button className="bg-white text-indigo-600 hover:bg-zinc-100 rounded-full px-12 h-16 text-lg font-black transition-all group shadow-xl">
                            Read Documentation
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
