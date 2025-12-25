"use client";

import { motion } from "framer-motion";
import { Plane, AlertTriangle, HeartPulse, ArrowRight, Activity, Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ImpactSection() {
    return (
        <section className="relative w-full py-24 px-4 overflow-hidden bg-gradient-to-br from-transparent via-background/20 to-black/80 border-y border-white/5">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background opacity-40 pointer-events-none" />

            <div className="container relative mx-auto max-w-6xl">
                <div className="flex flex-col items-center text-center space-y-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 group cursor-default">
                            Lives Lost Every Day to <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-600">Missing Medical History</span>
                            <span className="block h-1 w-0 bg-blue-500 group-hover:w-full transition-all duration-700 ease-out mt-2 opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.8)]"></span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed"
                    >
                        "He was traveling in London when he collapsed. The paramedics arrived within minutes,
                        but they didn't know about his severe Penicillin allergy. They administered the standard protocol.
                        <span className="text-white font-medium"> He never woke up.</span> This happens to Nigerians abroad every single week."
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <ImpactCard
                        icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
                        title="1 in 5"
                        description="Emergency deaths attributable to missing medical information (WHO)"
                        badge="Critical"
                        badgeColor="bg-red-500/10 text-red-500 border-red-500/20"
                        delay={0.1}
                    />
                    <ImpactCard
                        icon={<Activity className="w-8 h-8 text-blue-500" />}
                        title="Millions Wasted"
                        description="On repeat tests because previous records are inaccessible internationally"
                        badge="Inefficient"
                        badgeColor="bg-blue-500/10 text-blue-500 border-blue-500/20"
                        delay={0.2}
                    />
                    <ImpactCard
                        icon={<Plane className="w-8 h-8 text-orange-500" />}
                        title="Weekly Tragedy"
                        description="Travelers and diaspora face preventable risks every time they seek care"
                        badge="Urgent"
                        badgeColor="bg-orange-500/10 text-orange-500 border-orange-500/20"
                        delay={0.3}
                    />
                </div>

                {/* Timeline Graphic */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative p-8 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm mb-16 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Plane className="w-8 h-8 text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-blue-300">Board Flight</span>
                        </div>

                        <div className="hidden md:flex flex-1 h-px bg-gradient-to-r from-blue-500/50 to-red-500/50 relative">
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                                animate={{ left: ["0%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                        </div>

                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
                                <Hospital className="w-8 h-8 text-red-400" />
                            </div>
                            <span className="text-sm font-medium text-red-300">Emergency Abroad</span>
                        </div>

                        <div className="hidden md:flex flex-1 h-px bg-gradient-to-r from-red-500/50 to-orange-500/50 relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-sm" />
                        </div>

                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                <AlertTriangle className="w-8 h-8 text-orange-400" />
                            </div>
                            <span className="text-sm font-medium text-orange-300">Unknown Audit</span>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col items-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            HealthChain changes this forever.
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-blue-400/30">
                            See How It Works <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function ImpactCard({ icon, title, description, badge, badgeColor, delay }: { icon: React.ReactNode, title: string, description: string, badge: string, badgeColor: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group"
        >
            <Card className="h-full bg-black/40 border-white/5 backdrop-blur-sm overflow-hidden relative group-hover:border-white/10 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-6 flex flex-col items-start space-y-4 relative z-10">
                    <div className="flex items-center justify-between w-full">
                        <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10 group-hover:ring-white/20">
                            {icon}
                        </div>
                        <Badge variant="outline" className={`${badgeColor}`}>
                            {badge}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </CardContent>
            </Card>
        </motion.div>
    );
}
