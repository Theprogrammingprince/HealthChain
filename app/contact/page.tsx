'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in touch</h1>
                    <p className="text-gray-400 text-lg mb-12">
                        Have questions about enterprise integration or need patient support? We&apos;re here to help.
                    </p>

                    <div className="space-y-8">
                        {[
                            { icon: Mail, title: "Email us", lines: ["support@healthchain.io", "enterprise@healthchain.io"] },
                            { icon: Phone, title: "Call us", lines: ["+1 (555) 123-4567", "Mon-Fri from 8am to 5pm EST"] },
                            { icon: MapPin, title: "Visit us", lines: ["123 Blockchain Blvd", "New York, NY 10001"] }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex items-start gap-4"
                            >
                                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                    {item.lines.map((line, j) => (
                                        <p key={j} className={`text-gray-400 ${item.title === "Call us" && j === 1 ? "text-sm mt-1" : ""}`}>{line}</p>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                    <form className="relative z-10 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">First name</label>
                                <Input placeholder="John" className="bg-black/50 border-white/10 focus:border-blue-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Last name</label>
                                <Input placeholder="Doe" className="bg-black/50 border-white/10 focus:border-blue-500/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <Input placeholder="john@example.com" type="email" className="bg-black/50 border-white/10 focus:border-blue-500/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Message</label>
                            <Textarea placeholder="How can we help you?" className="min-h-[150px] bg-black/50 border-white/10 focus:border-blue-500/50" />
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-lg font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
                            Send Message
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
