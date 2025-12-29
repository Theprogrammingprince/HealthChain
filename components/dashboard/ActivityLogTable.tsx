"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    History,
    ExternalLink,
    Eye,
    Download,
    Plus,
    ShieldCheck,
    UserCheck
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

const actionIcons: Record<string, any> = {
    Viewed: Eye,
    Downloaded: Download,
    Uploaded: Plus,
    'Access Granted': UserCheck,
    'Access Revoked': ShieldCheck
};

const actionColors: Record<string, string> = {
    Viewed: "text-blue-400 bg-blue-400/5",
    Downloaded: "text-purple-400 bg-purple-400/5",
    Uploaded: "text-emerald-400 bg-emerald-400/5",
    'Access Granted': "text-indigo-400 bg-indigo-400/5",
    'Access Revoked': "text-red-400 bg-red-400/5"
};

export function ActivityLogTable() {
    const { activityLogs } = useAppStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="text-[#00BFFF] w-5 h-5" />
                    Access History
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-3 py-1">
                    <ShieldCheck className="w-3 h-3 mr-2" />
                    Blockchain Verified
                </Badge>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[180px]">Date / Time</TableHead>
                            <TableHead>Principal Actor</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead className="text-right">Polygon Scan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activityLogs.map((log, idx) => {
                            const Icon = actionIcons[log.action] || Eye;
                            const colorClass = actionColors[log.action] || "text-gray-400";

                            return (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <TableCell className="text-gray-400 font-mono text-[11px] font-medium">
                                        {log.date}
                                    </TableCell>
                                    <TableCell className="text-white font-semibold flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center border border-white/5`}>
                                            <Icon size={14} />
                                        </div>
                                        {log.actor}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${colorClass.split(' ')[0]}`}>
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="text-xs text-gray-600 hover:text-[#00BFFF] font-mono transition-colors flex items-center gap-2 justify-end ml-auto">
                                            {log.txHash}
                                            <ExternalLink size={12} />
                                        </button>
                                    </TableCell>
                                </motion.tr>
                            );
                        })}

                        {activityLogs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-600">
                                        <ShieldCheck className="w-10 h-10 mb-3 grayscale opacity-20" />
                                        <p className="text-sm">Log inititalized... waiting for activity.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 italic">
                        * This log is an immutable mirror of events recorded on the Polygon network.
                    </p>
                    <button className="text-[10px] font-bold text-[#00BFFF] hover:underline uppercase tracking-widest">
                        Export Audit Trail (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
}
