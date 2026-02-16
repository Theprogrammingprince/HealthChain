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
    Shield,
    FileText,
    Loader2,
    CheckCircle2,
    Phone,
    Clock,
    HelpCircle,
    Zap,
    Lock,
    ChevronRight,
    Video,
    FileQuestion
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { FAQPageJsonLd } from "@/components/seo/JsonLd";

const faqs = [
    {
        question: "How do I access my medical records in an emergency?",
        answer: "Every HealthChain user receives a unique Emergency Access Code. In emergencies, first responders can enter this code on our Emergency Portal to gain temporary, audited access to your critical health information (allergies, blood type, medications, etc.). All access is logged and you're notified immediately."
    },
    {
        question: "Is my health data secure on HealthChain?",
        answer: "Absolutely. Your data is protected with military-grade AES-256 encryption and stored using blockchain technology. Only you control who can access your records, and all access is logged and auditable. We're fully HIPAA compliant and never sell your data."
    },
    {
        question: "How can I grant or revoke access to my records?",
        answer: "Simply go to your Patient Dashboard and navigate to the Permissions section. You can grant access to specific doctors or hospitals, set permission levels (view only, full access, etc.), and revoke access instantly at any time. Changes take effect immediately."
    },
    {
        question: "What happens if I forget my password?",
        answer: "You can reset your password using the email associated with your account. For security reasons, we recommend enabling two-factor authentication. If you need additional help, our support team is available 24/7 to assist you."
    },
    {
        question: "Can I upload my existing medical records?",
        answer: "Yes! You can upload medical records in various formats (PDF, images, etc.) directly to your dashboard. Our system will organize them chronologically and make them accessible to authorized healthcare providers."
    },
    {
        question: "How do doctors access my records?",
        answer: "Doctors can request access to your records through the HealthChain platform. You'll receive a notification and can approve or deny the request. Once approved, they can view your records according to the permission level you set."
    },
    {
        question: "Is HealthChain available internationally?",
        answer: "Yes! HealthChain is designed for global accessibility. Your medical records travel with you wherever you go, ensuring continuity of care across borders. The platform supports multiple languages and complies with international healthcare data standards."
    },
    {
        question: "What if I need help setting up my account?",
        answer: "We offer comprehensive onboarding support including video tutorials, step-by-step guides, and live chat assistance. Our support team is available 24/7 to help you get started and answer any questions you may have."
    }
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const fullName = (formData.get('name') as string).trim();
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const messageBody = formData.get('message') as string;

        const nameParts = fullName.split(' ');
        const first_name = nameParts[0] || fullName;
        const last_name = nameParts.slice(1).join(' ') || '-';
        const message = subject ? `[${subject}] ${messageBody}` : messageBody;

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name, last_name, email, message }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send message');
            }

            toast.success("Message sent successfully!", {
                description: "Our team will review your message and respond within 24 hours."
            });
            (e.target as HTMLFormElement).reset();
        } catch (error: unknown) {
            const msg = (error as { message?: string }).message || 'Something went wrong';
            toast.error("Failed to send message", { description: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <FAQPageJsonLd faqs={faqs} />
            <Navbar />
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden bg-white">
                    {/* Background */}
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
                            <LifeBuoy size={100} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-1/4 right-10 text-primary/30"
                        >
                            <HelpCircle size={140} />
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
                                24/7 Support Available
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-8 leading-[1.05]"
                            >
                                How can we <br />
                                <span className="text-primary italic font-serif">help you today?</span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
                            >
                                Search our knowledge base, explore FAQs, or connect with our support team. We're here to ensure your HealthChain experience is seamless.
                            </motion.p>

                            {/* Search Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="max-w-2xl mx-auto relative"
                            >
                                <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Input
                                        type="text"
                                        placeholder="Search for help..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-16 rounded-full pl-16 text-lg border-2 focus:border-primary shadow-lg"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Quick Help Cards */}
                <section className="py-20 bg-slate-50">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">
                                    Quick Help Resources
                                </h2>
                                <p className="text-lg text-slate-600 font-medium">
                                    Find answers and get started quickly with these resources
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    {
                                        title: "Getting Started",
                                        desc: "Learn the basics of HealthChain",
                                        icon: Book,
                                        color: "text-blue-600",
                                        bg: "bg-blue-50"
                                    },
                                    {
                                        title: "Security & Privacy",
                                        desc: "Understanding data protection",
                                        icon: Shield,
                                        color: "text-emerald-600",
                                        bg: "bg-emerald-50"
                                    },
                                    {
                                        title: "Record Management",
                                        desc: "Upload and manage records",
                                        icon: FileText,
                                        color: "text-purple-600",
                                        bg: "bg-purple-50"
                                    },
                                    {
                                        title: "Emergency Access",
                                        desc: "Set up emergency protocols",
                                        icon: LifeBuoy,
                                        color: "text-red-600",
                                        bg: "bg-red-50"
                                    },
                                ].map((cat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className={`${cat.bg} p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                            <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-2">{cat.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{cat.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQs Section */}
                <section className="py-32 bg-white">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-16"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <FileQuestion className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                                    Frequently Asked Questions
                                </h2>
                                <p className="text-xl text-slate-600 font-medium">
                                    Find quick answers to common questions
                                </p>
                            </motion.div>

                            <div className="space-y-4">
                                {filteredFaqs.map((faq, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-primary/30 transition-all"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100 transition-colors"
                                        >
                                            <span className="font-bold text-slate-900 text-lg pr-4">{faq.question}</span>
                                            <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openFaq === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed border-t border-slate-200">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                                {filteredFaqs.length === 0 && (
                                    <div className="text-center py-16 text-slate-500">
                                        <FileQuestion className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No matching results found</p>
                                        <p className="text-sm">Try adjusting your search terms</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-32 bg-slate-50">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Contact Info */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-2xl">
                                            <MessageSquare className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Get in Touch</h2>
                                    </div>
                                    <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
                                        Can't find what you're looking for? Our support team is here to help you 24/7.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-50 p-3 rounded-xl shrink-0">
                                                <Mail className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Email Support</h4>
                                                <p className="text-slate-600 text-sm mb-2">Get detailed help via email</p>
                                                <a href="mailto:support@healthchain.com" className="text-primary font-semibold hover:underline">
                                                    support@healthchain.com
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-emerald-50 p-3 rounded-xl shrink-0">
                                                <Phone className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Phone Support</h4>
                                                <p className="text-slate-600 text-sm mb-2">Speak with our team directly</p>
                                                <a href="tel:+1-800-HEALTH" className="text-primary font-semibold hover:underline">
                                                    +1 (800) HEALTH-1
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-purple-50 p-3 rounded-xl shrink-0">
                                                <Clock className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1">Response Time</h4>
                                                <p className="text-slate-600 text-sm">Average response within 12 hours</p>
                                                <p className="text-slate-600 text-sm">Emergency support available 24/7</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Contact Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl">
                                        <h3 className="text-2xl font-black text-slate-900 mb-6">Send us a message</h3>
                                        <form onSubmit={handleSubmitTicket} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Your Name</label>
                                                <Input
                                                    name="name"
                                                    required
                                                    placeholder="John Doe"
                                                    className="h-12 border-2 focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                                <Input
                                                    name="email"
                                                    required
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="h-12 border-2 focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Subject</label>
                                                <Input
                                                    name="subject"
                                                    required
                                                    placeholder="How can we help?"
                                                    className="h-12 border-2 focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Message</label>
                                                <Textarea
                                                    name="message"
                                                    required
                                                    rows={5}
                                                    placeholder="Describe your question or issue..."
                                                    className="border-2 focus:border-primary resize-none"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Sending...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-5 h-5" />
                                                        Send Message
                                                    </div>
                                                )}
                                            </Button>
                                        </form>

                                        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-3 text-sm text-slate-600">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <span>We typically respond within 24 hours</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
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
                                    <LifeBuoy className="h-12 w-12 text-primary" />
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                                Still Need Help?
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                Our dedicated support team is ready to assist you with any questions or concerns.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/signup">
                                    <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold group shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                                        Get Started
                                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="/about">
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
