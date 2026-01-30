'use client';
import { ScrollText, AlertTriangle, Shield, Zap, Scale, FileWarning, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
    {
        icon: AlertTriangle,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        title: "1. No Liability",
        content: "HealthChain is a software interface. We are not responsible for any loss of keys, failed transactions due to blockchain congestion, or medical malpractice resulting from data usage. Users are responsible for maintaining their own wallet security and backup procedures."
    },
    {
        icon: Zap,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        title: "2. Immutable Actions",
        content: "Transactions on the blockchain are irreversible. Please verify all wallet addresses before granting access to your medical records. Once a transaction is confirmed, it cannot be undone. This immutability is by design to ensure data integrity."
    },
    {
        icon: FileWarning,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        title: "3. Beta Software",
        content: "HealthChain is currently in Beta. While we strive for stability, do not rely solely on this platform for critical, life-altering data without maintaining backups. Features may change, and occasional downtime is possible during this phase."
    },
    {
        icon: Shield,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        title: "4. User Responsibility",
        content: "You are solely responsible for the security of your wallet, private keys, and recovery phrases. HealthChain cannot recover lost credentials or reverse unauthorized transactions. We strongly recommend using hardware wallets for enhanced security."
    },
    {
        icon: Scale,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        title: "5. Governing Law",
        content: "These terms are governed by the laws of the jurisdiction in which HealthChain operates. Any disputes arising from the use of this platform will be resolved through binding arbitration. By using our service, you agree to these dispute resolution terms."
    }
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                        <ScrollText className="w-4 h-4" />
                        <span>Legal Agreement</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        By using HealthChain, you acknowledge that you are interacting with a decentralized protocol running on the Polygon blockchain.
                    </p>
                </motion.div>
            </section>

            {/* Important Notice */}
            <section className="py-8 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-400 mb-2">Important Notice</h3>
                            <p className="text-gray-400">
                                Please read these terms carefully before using HealthChain. By accessing or using our platform, you agree to be bound by these terms. If you do not agree, please do not use our services.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Content Sections */}
            <section className="py-12 px-6">
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
                                    <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
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

            {/* Agreement Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Questions About Our <span className="text-blue-400">Terms?</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10">
                        If you have any questions about these terms or need clarification, our team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/contact">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all group">
                                Contact Us
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/privacy">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 h-14 text-lg">
                                Privacy Policy
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
