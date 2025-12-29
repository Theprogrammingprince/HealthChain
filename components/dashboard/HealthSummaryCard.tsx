"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    HeartPulse,
    Droplet,
    ShieldAlert,
    Stethoscope,
    Pill,
    Edit3,
    TrendingUp,
    Scale,
    Clock,
    Dna
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

export function HealthSummaryCard() {
    const { userVitals } = useAppStore();

    return (
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] p-1 shadow-2xl rounded-3xl group">
            {/* Animated glow background */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#00BFFF]/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#00BFFF]/20 transition-all duration-700" />

            <div className="relative bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[22px] p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                    {/* Left: Vital Pulse */}
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="relative w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 "
                                >
                                    <HeartPulse className="text-red-500 w-8 h-8" />
                                </motion.div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">Your Health Vault</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0 text-[10px] uppercase font-bold tracking-widest">
                                        SYNCED ON-CHAIN
                                    </Badge>
                                    <span className="text-gray-500 text-xs">• Last synced: 2m ago</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Blood Type</p>
                                <div className="flex items-center gap-2">
                                    <Droplet className="text-red-500 w-4 h-4" />
                                    <span className="text-xl font-bold text-white">{userVitals.bloodType}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Genotype</p>
                                <div className="flex items-center gap-2">
                                    <Dna className="text-purple-400 w-4 h-4" />
                                    <span className="text-xl font-bold text-white">{userVitals.genotype}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">BP</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-emerald-500 w-4 h-4" />
                                    <span className="text-xl font-bold text-white">{userVitals.bloodPressure}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">BMI</p>
                                <div className="flex items-center gap-2">
                                    <Scale className="text-indigo-400 w-4 h-4" />
                                    <span className="text-xl font-bold text-white">{userVitals.bmi}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Clinical Summary */}
                    <div className="lg:w-[400px] grid grid-cols-1 gap-4">
                        {/* Allergies */}
                        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                            <ShieldAlert className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider mb-2">Severe Allergies</p>
                                <div className="flex flex-wrap gap-2">
                                    {userVitals.allergies.map(a => (
                                        <Badge key={a} variant="outline" className="bg-red-500/10 border-red-500/20 text-red-100 text-[10px]">
                                            {a}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Conditions & Meds */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="text-[#00BFFF] w-4 h-4" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chronic</span>
                                </div>
                                <div className="space-y-1">
                                    {userVitals.conditions.map(c => (
                                        <p key={c} className="text-xs text-white font-medium">{c}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Pill className="text-orange-400 w-4 h-4" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Meds</span>
                                </div>
                                <div className="space-y-1">
                                    {userVitals.medications.map(m => (
                                        <p key={m} className="text-xs text-white font-medium truncate" title={m}>{m}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">LATEST CHECKUP: {userVitals.lastCheckup}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 border-none cursor-default">
                                AUTO-UPDATE ON
                            </Badge>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group/btn">
                        <Edit3 size={14} className="group-hover/btn:text-[#00BFFF]" />
                        Edit Profile
                    </button>
                </div>
            </div>
        </Card>
    );
}
