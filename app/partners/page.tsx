"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Globe2, ShieldCheck, Stethoscope, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
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
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";

export default function PartnersPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success("Application Submitted", {
            description: "Thank you for your interest. Our partnership team will contact you shortly."
        });

        setIsLoading(false);
        // Reset form would go here
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <ParticlesBackground />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Handshake className="w-4 h-4" /> Partner Program
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Join the <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">HealthChain</span> Network
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Collaborate with us to revolutionize healthcare access. Whether you&apos;re a hospital, clinic, or research institution, let&apos;s build the future of patient data together.
                    </p>
                </motion.div>
            </section>

            {/* Benefits Grid */}
            <section className="py-20 px-4 bg-white/5 border-y border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon={<ShieldCheck className="w-10 h-10 text-green-500" />}
                        title="Secure & Compliant"
                        description="Leverage our HIPAA-compliant, blockchain-secured infrastructure for patient data exchange."
                    />
                    <BenefitCard
                        icon={<Globe2 className="w-10 h-10 text-blue-500" />}
                        title="Global Access"
                        description="Enable seamless record transfer for international patients and travel medicine."
                    />
                    <BenefitCard
                        icon={<Stethoscope className="w-10 h-10 text-purple-500" />}
                        title="Clinical Excellence"
                        description="Access comprehensive patient histories instantly to improve diagnosis and care outcomes."
                    />
                </div>
            </section>

            {/* Application Section */}
            <section className="py-24 px-4 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-start">

                    {/* Text Side */}
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl font-bold">Ready to Innovate?</h2>
                        <p className="text-gray-400 text-lg">
                            We select partners who share our vision of patient-centric, decentralized healthcare.
                        </p>

                        <div className="space-y-4">
                            <CheckItem text="Early access to new features" />
                            <CheckItem text="Technical integration support" />
                            <CheckItem text="Co-marketing opportunities" />
                            <CheckItem text="Revenue sharing models" />
                        </div>

                        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <h4 className="font-semibold text-blue-300 mb-2">Current Status</h4>
                            <p className="text-sm text-blue-200/70">
                                We are currently accepting pilot partners for Q1 2026. Slots are limited.
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full"
                    >
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input className="bg-white/5 border-white/10" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input className="bg-white/5 border-white/10" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Organization Name</Label>
                                    <Input className="bg-white/5 border-white/10" required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Organization Type</Label>
                                    <Select>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hospital">Hospital / Medical Center</SelectItem>
                                            <SelectItem value="clinic">Private Clinic</SelectItem>
                                            <SelectItem value="pharmacy">Pharmacy</SelectItem>
                                            <SelectItem value="lab">Diagnostic Lab</SelectItem>
                                            <SelectItem value="tech">HealthTech Vendor</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Work Email</Label>
                                    <Input type="email" className="bg-white/5 border-white/10" required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea
                                        className="bg-white/5 border-white/10 min-h-[120px]"
                                        placeholder="Tell us about your organization and goals..."
                                    />
                                </div>

                                <Button
                                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>Submit Application <ArrowRight className="ml-2 h-5 w-5" /></>
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

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors group">
            <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="text-gray-300">{text}</span>
        </div>
    );
}
