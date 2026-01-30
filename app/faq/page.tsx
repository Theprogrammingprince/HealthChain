'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, MessageSquare, ChevronRight, Shield, Lock, Users, Wallet, Activity, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
    { id: "security", label: "Security", icon: Shield, color: "text-emerald-400" },
    { id: "access", label: "Access Control", icon: Lock, color: "text-blue-400" },
    { id: "wallet", label: "Wallet & Keys", icon: Wallet, color: "text-amber-400" },
    { id: "general", label: "General", icon: HelpCircle, color: "text-purple-400" },
];

const faqs = [
    {
        category: "security",
        question: "How is my data secured?",
        answer: "Your medical records are encrypted using military-grade AES-256 encryption before being stored on IPFS. The hash of the record is then stored on the Polygon blockchain for verification. Only your private key can decrypt the data, ensuring complete privacy."
    },
    {
        category: "security",
        question: "Is HealthChain HIPAA compliant?",
        answer: "HealthChain is designed with privacy-first principles that align with GDPR and HIPAA requirements, specifically focusing on patient ownership and consent. Our architecture ensures that you maintain control over your data at all times."
    },
    {
        category: "access",
        question: "Can doctors see my data without permission?",
        answer: "Absolutely not. You must explicitly grant access to a doctor or hospital using their wallet address. This is done through a signed blockchain transaction. You can revoke this access at any time, instantly cutting off their ability to view your records."
    },
    {
        category: "access",
        question: "How do I grant access to a healthcare provider?",
        answer: "Navigate to your dashboard, click on 'Grant Access', and enter the provider's wallet address. You can set time limits and specify which records they can access. The provider will receive a notification and can then view your authorized records."
    },
    {
        category: "wallet",
        question: "What happens if I lose my private key?",
        answer: "Since HealthChain is non-custodial, we cannot recover your private key. This is by design for security. We strongly recommend using a secure hardware wallet, enabling social recovery options, and keeping a secure backup of your recovery phrase."
    },
    {
        category: "wallet",
        question: "Which wallets are supported?",
        answer: "HealthChain supports MetaMask, WalletConnect, Coinbase Wallet, and most Ethereum-compatible wallets. For the best security, we recommend using a hardware wallet like Ledger or Trezor."
    },
    {
        category: "general",
        question: "What does it cost to use?",
        answer: "Basic patient accounts are completely free. Transactions on the Polygon network cost fractions of a cent (typically $0.001-$0.01), and these are often subsidized by our platform for standard users. Premium features for healthcare providers may have additional costs."
    },
    {
        category: "general",
        question: "Can I export my data?",
        answer: "Yes! You have full ownership of your data. You can export all your medical records at any time in standard formats (PDF, JSON, FHIR). Your data is always portable and never locked into our platform."
    },
    {
        category: "general",
        question: "What blockchain does HealthChain use?",
        answer: "HealthChain operates on the Polygon network, a secure and environmentally-friendly Layer 2 solution for Ethereum. This provides fast, low-cost transactions while maintaining the security of the Ethereum ecosystem."
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
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-8 uppercase tracking-widest"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span>Help Center</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        How can we help?
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        Find answers to common questions about HealthChain, security, and managing your medical records.
                    </p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-xl mx-auto relative"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white/5 border-white/10 rounded-xl text-lg focus:border-purple-500/50 focus:ring-purple-500/20"
                        />
                    </motion.div>
                </motion.div>
            </section>

            {/* Category Filter */}
            <section className="py-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-3"
                    >
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all"
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            All Questions
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === cat.id
                                        ? "bg-white text-black"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 text-lg">No questions found matching your search.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                                className="text-purple-400 hover:text-purple-300 mt-2"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
                            <Accordion type="single" collapsible className="w-full space-y-2">
                                {filteredFaqs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`item-${index}`}
                                        className="border-b border-white/5 last:border-0"
                                    >
                                        <AccordionTrigger className="text-left text-lg hover:text-purple-400 hover:no-underline transition-colors py-6 font-medium">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-purple-500/50" />
                                                {faq.question}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-400 leading-relaxed pb-6 text-base pl-5">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Still Have Questions */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6">
                        <MessageSquare className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Still have <span className="text-purple-400">questions?</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Can&apos;t find what you&apos;re looking for? Our support team is here to help you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/contact">
                            <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-all group">
                                Contact Support
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/documentation">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 h-14 text-lg">
                                View Documentation
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
