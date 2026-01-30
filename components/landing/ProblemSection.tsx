"use client";

import { motion } from "framer-motion";
import { AlertCircle, FileX, History, Siren } from "lucide-react";

const problems = [
    {
        icon: <FileX className="h-8 w-8 text-rose-600" />,
        title: "Data Silos",
        text: "Medical records are scattered across isolated hospital systems."
    },
    {
        icon: <AlertCircle className="h-8 w-8 text-rose-600" />,
        title: "Access Barriers",
        text: "Patients struggle to access their own life-saving health history."
    },
    {
        icon: <History className="h-8 w-8 text-rose-600" />,
        title: "Critical Delays",
        text: "Information gaps lead to life-threatening delays in emergencies."
    }
];

export function ProblemSection() {
    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center mb-6"
                    >
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100 shadow-sm animate-pulse">
                            <Siren className="h-8 w-8" />
                        </div>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight"
                    >
                        Healthcare data is <br />still fragmented.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        The status quo puts lives at risk. Fragmented systems prevent doctors from seeing the full picture when it matters most.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            className="bg-white p-10 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm hover:shadow-2xl hover:border-rose-100 transition-all duration-500 group"
                        >
                            <div className="bg-rose-50 p-5 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300 border border-rose-100/50">
                                {problem.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{problem.title}</h3>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                {problem.text}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
