"use client";

import { motion } from "framer-motion";
import { UserPlus, Hospital, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Create Your Health Identity",
        description: "Securely sign up via our clinical portal. Your identity is verified against global healthcare standards.",
        icon: <UserPlus className="h-8 w-8" />
    },
    {
        number: "02",
        title: "Providers Upload Records",
        description: "Verified doctors and hospitals upload and sign medical records directly to your profile.",
        icon: <Hospital className="h-8 w-8" />
    },
    {
        number: "03",
        title: "You Control Access",
        description: "Grant or revoke access to your records instantly. Everything is reviewed and patient-approved.",
        icon: <CheckCircle2 className="h-8 w-8" />
    }
];

export function HowItWorksSection() {
    return (
        <section className="py-32 bg-white relative">
            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight"
                    >
                        Medical history, <br />simplified for everyone.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative max-w-6xl mx-auto">
                    {/* Visual Connector Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-[4.5rem]" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-12">
                                <div className="absolute -top-4 -right-4 text-6xl font-black text-slate-50 select-none group-hover:text-primary/5 transition-colors">
                                    {step.number}
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:border-primary/20 text-primary transition-all duration-500 relative z-10">
                                    {step.icon}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 z-20 text-slate-200">
                                        <ArrowRight size={24} />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h3>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
