"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface VitalsCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    unit?: string;
    color: string;
    pulse?: boolean;
}

export function VitalsCard({ label, value, icon: Icon, unit, color, pulse }: VitalsCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, translateY: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                    <Icon size={48} />
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} flex items-center justify-center`}>
                        <motion.div
                            animate={pulse ? {
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.8, 1]
                            } : {}}
                            transition={pulse ? {
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            } : {}}
                        >
                            <Icon className={color} size={20} />
                        </motion.div>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">{label}</span>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {unit && <span className="text-gray-500 text-xs">{unit}</span>}
                </div>

                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${color.replace('text-', 'bg-')}`}
                    />
                </div>
            </Card>
        </motion.div>
    );
}
