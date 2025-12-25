'use client';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto px-6 text-center"
            >
                <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
                <p className="text-xl text-gray-400 mb-12">
                    Help us rebuild the healthcare infrastructure of the internet.
                </p>
            </motion.div>

            <div className="max-w-4xl mx-auto px-6 grid gap-6">
                {[
                    { title: "Senior Smart Contract Engineer", meta: "Remote • Engineering • Full-time" },
                    { title: "Full Stack Developer (Next.js)", meta: "Remote • Engineering • Full-time" },
                    { title: "Product Designer", meta: "New York / Remote • Design • Full-time" }
                ].map((role, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{role.title}</h3>
                            <p className="text-gray-400 text-sm">{role.meta}</p>
                        </div>
                        <Button variant="outline" className="border-white/20 hover:bg-white hover:text-black">View Role</Button>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-12"
            >
                <p className="text-gray-500">Don&apos;t see a role for you?</p>
                <a href="#" className="text-blue-400 hover:underline">Email us your resume</a>
            </motion.div>
        </div>
    )
}
