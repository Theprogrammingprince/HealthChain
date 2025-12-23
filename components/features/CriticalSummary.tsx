"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Droplets, Pill, Clock, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function CriticalSummary() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <Card className="relative overflow-hidden border-primary/30 bg-background/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,191,255,0.1)]">
                {/* Ambient Background Pulse */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px] animate-pulse"></div>

                <CardHeader className="border-b border-primary/10 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Activity className="h-6 w-6 text-primary animate-pulse" />
                                <div className="absolute inset-0 bg-primary/40 blur-lg animate-pulse"></div>
                            </div>
                            <CardTitle className="text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                Critical Health Summary
                            </CardTitle>
                        </div>
                        <span className="text-xs font-mono text-primary/70 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            VERIFIED ON-CHAIN
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    <SummaryItem
                        icon={<Droplets className="h-5 w-5 text-red-500" />}
                        label="Blood Type"
                        value="O+"
                        sub="Universal Donor"
                    />
                    <SummaryItem
                        icon={<Activity className="h-5 w-5 text-orange-500" />}
                        label="Allergies"
                        value="2 Active"
                        sub="Penicillin, Peanuts"
                        alert
                    />
                    <SummaryItem
                        icon={<Pill className="h-5 w-5 text-blue-500" />}
                        label="Medications"
                        value="Insulin"
                        sub="Daily • 10mg"
                    />
                    <SummaryItem
                        icon={<Clock className="h-5 w-5 text-green-500" />}
                        label="Last Updated"
                        value="2 Days Ago"
                        sub="By Dr. Smith"
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}

function SummaryItem({ icon, label, value, sub, alert = false }: { icon: React.ReactNode, label: string, value: string, sub: string, alert?: boolean }) {
    return (
        <div className="group relative p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit {label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-background/50 border border-white/10 ${alert ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
                    <h4 className={`text-2xl font-bold tracking-tight ${alert ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white'}`}>
                        {value}
                    </h4>
                    <p className="text-xs text-muted-foreground/80 mt-1">{sub}</p>
                </div>
            </div>
        </div>
    );
}
