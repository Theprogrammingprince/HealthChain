"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Hospital, UserCheck, Search } from "lucide-react";
import Image from "next/image";

const features = [
    {
        icon: <Zap className="h-6 w-6" />,
        title: "Emergency-Ready Access",
        description: "Doctors can instantly see allergies, medications, and conditions when time is critical."
    },
    {
        icon: <Hospital className="h-6 w-6" />,
        title: "Verified Medical Records",
        description: "All records are reviewed by healthcare institutions before reaching patients."
    },
    {
        icon: <UserCheck className="h-6 w-6" />,
        title: "Patient-Controlled Data",
        description: "You approve every record and every access."
    },
    {
        icon: <Lock className="h-6 w-6" />,
        title: "Privacy by Design",
        description: "Your health data is protected by strong encryption and access controls."
    },
    {
        icon: <Shield className="h-6 w-6" />,
        title: "Trusted Healthcare Network",
        description: "Only verified hospitals and clinicians can participate."
    }
];

export function FeaturesSection() {
    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center mb-6"
                    >
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Search className="h-8 w-8" />
                        </div>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight"
                    >
                        Built for safety, <br />speed, and trust.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`p-10 rounded-[2rem] border border-slate-200 bg-white hover:border-primary/30 hover:shadow-2xl medical-glow transition-all duration-500 group relative overflow-hidden ${index === 0 ? "lg:col-span-2 min-h-[400px]" : ""
                                }`}
                        >
                            {index === 0 && (
                                <div className="absolute inset-0 z-0 opacity-10">
                                    <Image
                                        src="/images/landing/features_abstract.png"
                                        alt="Abstract Visual"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:border-primary/20 text-primary shadow-sm transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-md">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E40AF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </section>
    );
}
