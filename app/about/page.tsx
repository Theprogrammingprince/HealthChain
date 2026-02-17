"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    ChevronRight,
    Shield,
    Heart,
    Users,
    Globe,
    Lock,
    Zap,
    Target,
    Eye,
    Lightbulb,
    Award,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 overflow-hidden bg-white">
                    {/* Background with gradient */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white" />
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-10 text-primary/30"
                        >
                            <Heart size={100} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-1/4 right-10 text-primary/30"
                        >
                            <Shield size={140} />
                        </motion.div>
                    </div>

                    <div className="container px-4 mx-auto relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-semibold mb-8 border border-primary/10 tracking-wide uppercase"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                Our Story & Mission
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-8 leading-[1.05]"
                            >
                                Empowering patients. <br />
                                <span className="text-primary italic font-serif">Transforming healthcare.</span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
                            >
                                HealthChain is revolutionizing how medical records are stored, shared, and accessed — putting patients in control of their health data while enabling seamless, life-saving care.
                            </motion.p>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-5"
                            >
                                <Link href="/signup">
                                    <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold group shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                                        Join HealthChain
                                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3 text-muted-foreground font-semibold">
                                    <Lock className="h-5 w-5 text-primary" />
                                    <span>HIPAA Compliant & Secure</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-32 bg-slate-50">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-2xl">
                                            <Target className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Our Mission</h2>
                                    </div>
                                    <p className="text-xl text-slate-600 leading-relaxed mb-6 font-medium">
                                        To create a world where every patient has instant, secure access to their complete medical history — enabling better care, faster treatment, and saved lives.
                                    </p>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                        We believe healthcare data should be portable, private, and patient-owned. By leveraging blockchain technology and modern encryption, we're building the infrastructure for the future of healthcare.
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                                                <Shield className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Security First</h4>
                                                <p className="text-slate-600 text-sm">Military-grade encryption protects your sensitive health information.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Patient Control</h4>
                                                <p className="text-slate-600 text-sm">You decide who accesses your records and for how long.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                                                <Zap className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Instant Access</h4>
                                                <p className="text-slate-600 text-sm">Emergency responders can access critical information in seconds.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className="relative"
                                >
                                    <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-8 border-slate-200 shadow-2xl">
                                        <div className="aspect-[4/5] relative bg-gradient-to-br from-primary/20 to-primary/5">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Image src="/logo.svg" alt="HealthChain" width={128} height={128} className="opacity-30" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="py-32 bg-white">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto text-center mb-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="flex justify-center mb-6"
                            >
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Eye className="h-8 w-8 text-primary" />
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6"
                            >
                                Our Vision
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-600 font-medium leading-relaxed"
                            >
                                A future where medical records are no longer trapped in silos, where patients have complete ownership of their health data, and where life-saving information is available anywhere, anytime.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Globe,
                                    title: "Global Accessibility",
                                    description: "Your medical records travel with you across borders, ensuring continuity of care wherever you go."
                                },
                                {
                                    icon: Heart,
                                    title: "Better Outcomes",
                                    description: "Complete medical histories enable doctors to make more informed decisions and provide better care."
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Healthcare Innovation",
                                    description: "Empowering the next generation of healthcare solutions built on secure, interoperable data."
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                                >
                                    <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6">
                                        <item.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-32 bg-slate-50">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto text-center mb-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="flex justify-center mb-6"
                            >
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Award className="h-8 w-8 text-primary" />
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6"
                            >
                                Our Core Values
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-600 font-medium leading-relaxed"
                            >
                                The principles that guide everything we do at HealthChain.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    icon: Shield,
                                    title: "Privacy & Security",
                                    description: "We treat your health data with the highest level of security and respect. Your information is encrypted, protected, and never sold.",
                                    color: "text-blue-600"
                                },
                                {
                                    icon: Users,
                                    title: "Patient Empowerment",
                                    description: "You own your data. You control who sees it. We believe patients should be at the center of their healthcare journey.",
                                    color: "text-purple-600"
                                },
                                {
                                    icon: Lightbulb,
                                    title: "Innovation",
                                    description: "We're constantly pushing boundaries to create better solutions for healthcare data management and accessibility.",
                                    color: "text-amber-600"
                                },
                                {
                                    icon: Heart,
                                    title: "Compassion",
                                    description: "Every feature we build is designed with real people in mind — patients, doctors, and families who need reliable healthcare.",
                                    color: "text-red-600"
                                }
                            ].map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group"
                                >
                                    <div className="bg-slate-50 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary/10 transition-colors">
                                        <value.icon className={`h-8 w-8 ${value.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4">{value.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-white">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 md:p-16 rounded-[3rem] border border-primary/20"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    <Image src="/logo.svg" alt="HealthChain" width={48} height={48} />
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                                Join the Healthcare Revolution
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                Be part of the movement to transform healthcare data management. Your health, your data, your control.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/signup">
                                    <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold group shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                                        Get Started Today
                                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="/support">
                                    <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg font-bold border-2">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
}
