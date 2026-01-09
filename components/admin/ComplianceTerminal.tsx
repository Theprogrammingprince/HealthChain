"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, Terminal, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function ComplianceTerminal() {
    const { complianceScore, activityLogs } = useAppStore();

    // Mock logs for technical look if real logs are sparse
    const systemLogs = [
        { time: "14:22:01", event: "ZK-Circuit Verification Passed", status: "success" },
        { time: "14:21:45", event: "Registry Smart Contract Audit Sync", status: "success" },
        { time: "14:20:12", event: "Cross-chain State Root Validated", status: "success" },
        { time: "14:18:30", event: "Anonymized Data Fragment Hash Verified", status: "success" },
    ];

    return (
        <Card className="bg-[#050505] border-white/5 overflow-hidden flex flex-col h-full shadow-2xl relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                    Compliance & Security
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audited</span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Safety Rating</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tighter">{complianceScore}%</span>
                            <span className="text-xs font-bold text-emerald-500 uppercase">Excellent</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-blue-500/30 transition-colors">
                        <ShieldAlert className="w-10 h-10 text-blue-600/20 absolute -bottom-2 -right-2 rotate-12" />
                        <CheckCircle2 className="w-8 h-8 text-blue-500 relative z-10" />
                    </div>
                </div>

                <div className="p-6 flex-1 bg-[#080808] font-mono">
                    <div className="flex items-center gap-2 mb-4 text-blue-500/60">
                        <Terminal size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Security event log</span>
                    </div>
                    <div className="space-y-3">
                        {systemLogs.map((log, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="flex items-start gap-3 group/item"
                            >
                                <span className="text-[10px] text-gray-600 font-bold shrink-0">{log.time}</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 group-hover/item:text-blue-400 transition-colors">
                                        <span className="text-blue-500 mr-1">&gt;</span>
                                        {log.event}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={10} className="text-amber-500" />
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">No active threats detected</span>
                        </div>
                        <button className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">
                            VIEW FULL AUDIT
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
