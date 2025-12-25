'use client';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Stethoscope, Hospital, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProvidersPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <section className="relative pt-32 pb-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">For Healthcare Providers</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Streamline patient data access, reduce administrative burden, and ensure 100% data integrity with HealthChain.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="px-6 pb-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Stethoscope, color: "text-blue-400", title: "Instant History Access", desc: "Get a patient's full medical history in seconds—no faxing, no phone calls. Just smart contract authorization." },
                    { icon: Hospital, color: "text-green-400", title: "Interoperable", desc: "Works across borders and systems. Our standardized data format ensures you can read records from any other HealthChain provider." },
                    { icon: Activity, color: "text-purple-400", title: "Real-time Updates", desc: "Updates made by other specialists appear instantly. Coordinate care like never before." }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all"
                    >
                        <item.icon className={`w-10 h-10 ${item.color} mb-6`} />
                        <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                        <p className="text-gray-400">{item.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* Verification Section */}
            <section className="bg-blue-900/10 py-20 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">Join the Network</h2>
                    <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="text-blue-500" />
                            <span>Verified Identity System</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="text-blue-500" />
                            <span>HIPAA-Compliant Storage</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="text-blue-500" />
                            <span>Zero Integration Cost</span>
                        </div>
                    </div>
                    <Link href="/contact">
                        <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                            Request Provider Access
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
