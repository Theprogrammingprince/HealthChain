"use client";

import { useAppStore } from "@/lib/store";
import { ShieldCheck, Lock, Server, FileCheck, AlertOctagon } from "lucide-react";

export function ComplianceTerminal() {
    const { complianceScore } = useAppStore();

    const logs = [
        { id: 1, event: "HIPAA Check: Encryption validation", status: "PASS", time: "10:42:01" },
        { id: 2, event: "GDPR: Data residency check (EU-West)", status: "PASS", time: "10:42:05" },
        { id: 3, event: "Access Control: Role-based audit", status: "PASS", time: "10:42:12" },
        { id: 4, event: "ZK-Proof Integrity Verify", status: "PASS", time: "10:42:15" },
        { id: 5, event: "Check: Off-chain storage availability", status: "WARN", time: "10:43:00" },
    ];

    return (
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        Compliance Sentinel
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Real-time regulatory audit logs</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-2xl font-black text-white">{complianceScore}%</div>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Health Score</div>
                </div>
            </div>

            <div className="flex-1 p-0 overflow-hidden flex flex-col">
                <div className="flex items-center gap-4 bg-white/2 p-3 border-b border-white/5 text-[10px] font-mono text-gray-400">
                    <div className="flex items-center gap-1.5"><Lock size={10} /> AES-256 ENFORCED</div>
                    <div className="flex items-center gap-1.5"><Server size={10} /> NODES: 12/12</div>
                    <div className="flex items-center gap-1.5"><FileCheck size={10} /> AUDIT: ACTIVE</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/20 font-mono text-xs">
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-gray-600">[{log.time}]</span>
                            <span className={`font-bold ${log.status === 'PASS' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                {log.status}
                            </span>
                            <span className="text-gray-300">{log.event}</span>
                        </div>
                    ))}
                    <div className="text-emerald-500/50 animate-pulse">_</div>
                </div>
            </div>
        </div>
    );
}
