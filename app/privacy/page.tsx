'use client';
import { Shield, Lock, Eye, UserCheck, Server, FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
    {
        icon: Lock,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        title: "1. Data Ownership",
        content: "All data uploaded to HealthChain is encrypted client-side using AES-256 encryption. The encrypted blobs are stored on IPFS. The decryption keys are held solely by you (the patient). HealthChain developers possess no \"master key\" and cannot access your medical data under any circumstances."
    },
    {
        icon: Eye,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        title: "2. Blockchain Transparency",
        content: "While your actual medical data is encrypted and hidden, the transactions (e.g., \"User A granted access to Doctor B\") are public on the Polygon blockchain. This ensures an immutable audit trail of who accessed your records and when, providing complete transparency without compromising privacy."
    },
    {
        icon: UserCheck,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        title: "3. Third-Party Access",
        content: "No third party can access your data unless you explicitly sign a smart contract transaction granting them permission. You may revoke this permission at any time, instantly cutting off access. We never sell, share, or monetize your personal health information."
    },
    {
        icon: Server,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        title: "4. Data Storage",
        content: "Your medical records are stored across a decentralized network using IPFS (InterPlanetary File System). This means no single point of failure and no central server that can be hacked. Each piece of data is content-addressed and cryptographically verified."
    },
    {
        icon: FileText,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/20",
        title: "5. Regulatory Compliance",
        content: "HealthChain is designed with privacy-first principles that align with GDPR, HIPAA, and other international healthcare data protection regulations. Our architecture ensures patient consent is at the center of every data transaction."
    }
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 uppercase tracking-widest"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Privacy First Architecture</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        At HealthChain, privacy is not an option — it&apos;s the foundation of our entire architecture.
                    </p>
                </motion.div>
            </section>

            {/* Content Sections */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-8 rounded-3xl bg-white/[0.02] border ${section.borderColor} backdrop-blur-sm hover:bg-white/[0.04] transition-all group`}
                        >
                            <div className="flex items-start gap-6">
                                <div className={`p-4 rounded-2xl ${section.bgColor} group-hover:scale-110 transition-transform`}>
                                    <section.icon className={`w-8 h-8 ${section.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                                        {section.title}
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Your Data, Your <span className="text-emerald-400">Control</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Ready to take control of your medical records? Join thousands of patients who trust HealthChain with their health data.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all group">
                                Get Started Free
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/terms">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 h-14 text-lg">
                                View Terms
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Last Updated */}
            <div className="pb-20 text-center">
                <p className="text-sm text-gray-600">
                    Last updated: January 2026 • Version 2.1
                </p>
            </div>
        </div>
    );
}
