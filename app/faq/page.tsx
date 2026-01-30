'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, MessageSquare, ChevronRight, Shield, Lock, Users, Wallet, Activity, Globe, Cpu, Zap, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
    { id: "security", label: "Protocol Security", icon: Shield, color: "text-blue-400" },
    { id: "access", label: "Access Logic", icon: Lock, color: "text-emerald-400" },
    { id: "wallet", label: "Sovereign Keys", icon: Wallet, color: "text-purple-400" },
    { id: "general", label: "Network General", icon: Globe, color: "text-cyan-400" },
];

const faqs = [
    {
        category: "security",
        question: "How is my data secured within the protocol?",
        answer: "Your medical records are encrypted using military-grade AES-256 encryption before being sharded and stored on IPFS. The hash is then anchored to the Polygon blockchain. Only your private key can assemble and decrypt the payload."
    },
    {
        category: "security",
        question: "Is HealthChain HIPAA and GDPR compliant?",
        answer: "HealthChain exceeds HIPAA and GDPR standards by moving from 'trust' to 'verification'. Our architecture ensures that you maintain absolute sovereignty over your clinical data, automating compliance through smart contract logic."
    },
    {
        category: "access",
        question: "Can clinicians access my records without authorization?",
        answer: "Categorically no. No entity—clinical or administrative—can bypass your encryption. Access is only possible if you sign a cryptographic permission grant to a specific provider's public key."
    },
    {
        category: "access",
        question: "How do I revoke clinical access?",
        answer: "Revocation is instant and irreversible. Through your dashboard, you sign a 'Revoke' transaction which rotates your record's metadata on the protocol level, instantly cutting off the provider's node from the data shard."
    },
    {
        category: "wallet",
        question: "What happens if I lose my private key?",
        answer: "As a non-custodial protocol, we have no mechanism to recover lost keys. Your private key is your only password to your clinical history. We strongly recommend using hardware wallets and secure personal backups."
    },
    {
        category: "wallet",
        question: "Which protocols and wallets are supported?",
        answer: "We support the full WalletConnect ecosystem, MetaMask, and major hardware nodes like Ledger. For clinical entities, we provide dedicated professional-grade wallet infrastructure."
    },
    {
        category: "general",
        question: "What are the costs associated with the network?",
        answer: "Patient profiles are free to initialize. Network gas fees on Polygon are fractions of a cent and are typically subsidized by our protocol for standard clinical interactions."
    },
    {
        category: "general",
        question: "Can I migrate my data from legacy EHR systems?",
        answer: "Yes. Our ingestion engine supports HL7, FHIR, and standard JSON formats. Verified clinicians can push legacy data into your sovereign profile with a single batch transaction."
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Massive Atmospheric Header */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-[1400px] mx-auto text-center space-y-12"
                >
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            <HelpCircle className="w-3 h-3" />
                            <span>Clinical Support Network</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase italic font-serif">
                            Common <br /> <span className="text-blue-600 not-italic font-sans">Queries.</span>
                        </h1>
                    </div>

                    {/* Enhanced Search Architecture */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search clinical protocols, security specs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-20 pl-16 pr-8 bg-zinc-950 border-white/10 rounded-2xl text-xl font-bold focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-gray-700 transition-all"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Logical Category Filter */}
            <section className="py-12 px-6 border-b border-white/5 bg-zinc-950/20 backdrop-blur-3xl sticky top-[72px] z-40">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === "all"
                                ? "bg-white text-black shadow-3xl shadow-white/10"
                                : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            All Payloads
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeCategory === cat.id
                                    ? "bg-white text-black shadow-3xl shadow-white/10"
                                    : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Logic Controller */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {filteredFaqs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32 space-y-6"
                            >
                                <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-white/5">
                                    <Fingerprint className="w-10 h-10 text-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-white uppercase italic">No Match Found</p>
                                    <p className="text-gray-600 font-medium">Refine your search parameters or select a different payload category.</p>
                                </div>
                                <Button
                                    variant="link"
                                    onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                                    className="text-blue-500 font-black uppercase tracking-widest text-[10px]"
                                >
                                    Reset Consensus &rarr;
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    {filteredFaqs.map((faq, index) => (
                                        <AccordionItem
                                            key={index}
                                            value={`item-${index}`}
                                            className="border-none"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <AccordionTrigger className="flex gap-4 px-10 py-10 rounded-[2.5rem] bg-zinc-950/50 border border-white/5 hover:border-blue-500/20 hover:bg-zinc-900 hover:no-underline transition-all group text-left">
                                                    <div className="flex items-center gap-6 flex-1">
                                                        <span className="text-[10px] font-black text-blue-500/40 group-hover:text-blue-500 transition-colors uppercase italic font-serif">Q.{index + 1}</span>
                                                        <span className="text-xl font-black text-white uppercase tracking-tight leading-tight">{faq.question}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-16 pt-8 pb-12 text-gray-400 leading-relaxed text-lg font-medium border-x border-b border-white/5 rounded-b-[2.5rem] bg-black/40">
                                                    <div className="flex gap-6">
                                                        <div className="pt-1"><Zap className="w-5 h-5 text-blue-500/20" /></div>
                                                        {faq.answer}
                                                    </div>
                                                </AccordionContent>
                                            </motion.div>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Direct Support Infrastructure */}
            <section className="py-32 px-6 bg-zinc-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-[1400px] mx-auto bg-black border border-white/5 rounded-[4rem] p-24 text-center relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />

                    <div className="relative z-10 space-y-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <MessageSquare className="w-3 h-3 text-blue-500" />
                            <span>Support Node 03 Active</span>
                        </div>

                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none italic font-serif">
                            Still Offline? <br /> <span className="text-blue-600 not-italic font-sans">Contact Us.</span>
                        </h2>

                        <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            For complex clinical integration or recovery queries, our direct support nodes are operational 24/7.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                            <Link href="/contact">
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-12 h-20 text-xl font-black uppercase tracking-widest shadow-3xl shadow-blue-600/30 transition-all group">
                                    Initialize Chat
                                    <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/documentation">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-10 h-20 text-lg font-bold uppercase tracking-widest">
                                    Technical Docs
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-20 flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        Global Support Hub • Active Nodes: 12
                    </p>
                    <div className="flex items-center gap-8 text-[9px] font-black uppercase text-gray-800 tracking-widest">
                        <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> <span>Unified Support</span></div>
                        <div className="flex items-center gap-2"><Cpu className="w-3 h-3" /> <span>Automated Routing</span></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
