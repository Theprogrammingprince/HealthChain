"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Simulated historical data
const data = [
    { date: "Oct", bp: 130, glucose: 110 },
    { date: "Nov", bp: 125, glucose: 105 },
    { date: "Dec", bp: 122, glucose: 98 },
    { date: "Jan", bp: 118, glucose: 95 },
    { date: "Feb", bp: 120, glucose: 92 },
];

export function VitalsTimeline() {
    const maxVal = 150;
    const width = 600;
    const height = 180;

    // Calculate SVG points
    const bpPoints = data.map((d, i) => `${(i * (width / (data.length - 1)))},${height - (d.bp / maxVal) * height}`).join(" ");
    const glucosePoints = data.map((d, i) => `${(i * (width / (data.length - 1)))},${height - (d.glucose / maxVal) * height}`).join(" ");

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-indigo-400 w-5 h-5" />
                        Clinical Trend Analysis
                    </h3>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-[0.2em]">6-Month Vitals Longitudinal View</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sys BP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00BFFF]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Glucose</span>
                    </div>
                </div>
            </div>

            <div className="relative h-[200px] w-full pt-4">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    {[1, 2, 3].map(i => <div key={i} className="w-full border-t border-white/10 border-dashed" />)}
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* BP Line */}
                    <motion.polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={bpPoints}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Glucose Line */}
                    <motion.polyline
                        fill="none"
                        stroke="#00BFFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={glucosePoints}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {data.map((d, i) => {
                        const x = (i * (width / (data.length - 1)));
                        return (
                            <g key={i}>
                                <motion.circle
                                    cx={x} cy={height - (d.bp / maxVal) * height} r="4" fill="#ef4444"
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }}
                                />
                                <motion.circle
                                    cx={x} cy={height - (d.glucose / maxVal) * height} r="4" fill="#00BFFF"
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.1 }}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* X-Axis labels */}
                <div className="flex justify-between mt-6 px-1">
                    {data.map(d => (
                        <span key={d.date} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{d.date}</span>
                    ))}
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-bold px-3 py-1">
                        <Activity className="w-3 h-3 mr-2" /> STABLE TREND
                    </Badge>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-700" />
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.15em]">Last Scan Completed: Today 08:30 AM</span>
                    </div>
                </div>
                <button className="text-[10px] font-black text-[#00BFFF] hover:underline uppercase tracking-widest">
                    View Detailed Analytics
                </button>
            </div>
        </div>
    );
}
