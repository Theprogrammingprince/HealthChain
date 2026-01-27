"use client";

import { motion } from "framer-motion";
import { Siren, Plane, History, Stethoscope } from "lucide-react";

const useCases = [
    {
        icon: <Siren className="h-8 w-8" />,
        title: "Emergency Situations",
        description: "ER doctors can access your allergies and blood type instantly, even if you're unconscious.",
        color: "rose"
    },
    {
        icon: <Plane className="h-8 w-8" />,
        title: "International Travel",
        description: "Your health records follow you across borders, translated and accessible globally.",
        color: "primary"
    },
    {
        icon: <History className="h-8 w-8" />,
        title: "Chronic Care",
        description: "Keep all your specialists on the same page with a unified history of treatments.",
        color: "primary"
    }
];

export function UseCasesSection() {
    return (
        <section className="py-32 bg-slate-50">
            <div className="container px-4 mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center mb-6"
                    >
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                            <Stethoscope className="h-8 w-8" />
                        </div>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight"
                    >
                        Care when it <br />matters most.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group"
                        >
                            <div className={`p-5 rounded-3xl mb-10 w-fit transition-transform group-hover:scale-110 duration-300 ${useCase.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-primary/5 text-primary border border-primary/10'
                                }`}>
                                {useCase.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{useCase.title}</h3>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                {useCase.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
