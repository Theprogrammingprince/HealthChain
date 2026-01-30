"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    History,
    ExternalLink,
    Eye,
    Download,
    Plus,
    ShieldCheck,
    UserCheck,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    Filter,
    Loader2,
    FileDown,
    Calendar
} from "lucide-react";
import { useAppStore, ActivityLog } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { getActivityLogs, getActivityLogStats } from "@/lib/database.service";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

const actionIcons: Record<string, any> = {
    Viewed: Eye,
    Downloaded: Download,
    Uploaded: Plus,
    'Access Granted': UserCheck,
    'Access Revoked': ShieldCheck,
    'Record Approved': CheckCircle,
    'Record Rejected': XCircle,
    'Emergency Access': AlertTriangle
};

const actionColors: Record<string, string> = {
    Viewed: "text-blue-400 bg-blue-400/10",
    Downloaded: "text-purple-400 bg-purple-400/10",
    Uploaded: "text-emerald-400 bg-emerald-400/10",
    'Access Granted': "text-indigo-400 bg-indigo-400/10",
    'Access Revoked': "text-red-400 bg-red-400/10",
    'Record Approved': "text-green-400 bg-green-400/10",
    'Record Rejected': "text-rose-400 bg-rose-400/10",
    'Emergency Access': "text-amber-400 bg-amber-400/10"
};

type ActivityLogStats = {
    total: number;
    viewed: number;
    downloaded: number;
    uploaded: number;
    accessGranted: number;
    accessRevoked: number;
    recordApproved: number;
    recordRejected: number;
    emergencyAccess: number;
};

export function ActivityLogTable() {
    const { supabaseUser } = useAppStore();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<ActivityLogStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showStats, setShowStats] = useState(true);

    useEffect(() => {
        if (supabaseUser?.id) {
            loadActivityLogs();
            loadStats();
        }
    }, [supabaseUser?.id, actionFilter]);

    const loadActivityLogs = async () => {
        if (!supabaseUser?.id) return;

        setIsLoading(true);
        try {
            const data = await getActivityLogs(supabaseUser.id, {
                actionFilter: actionFilter,
                limit: 100
            });
            setLogs(data as ActivityLog[]);
        } catch (error) {
            console.error("Error loading activity logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        if (!supabaseUser?.id) return;

        const data = await getActivityLogStats(supabaseUser.id);
        setStats(data);
    };

    const filteredLogs = logs.filter(log =>
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleExportPDF = () => {
        // Create a simple text export for now
        const content = filteredLogs.map(log =>
            `${log.date} | ${log.actor} | ${log.action} | ${log.details || 'N/A'} | ${log.txHash}`
        ).join('\n');

        const blob = new Blob([
            'HEALTHCHAIN AUDIT TRAIL EXPORT\n',
            '================================\n',
            `Generated: ${new Date().toISOString()}\n`,
            `Total Records: ${filteredLogs.length}\n`,
            `Filter Applied: ${actionFilter === 'all' ? 'None' : actionFilter}\n\n`,
            'DATE | ACTOR | ACTION | DETAILS | TX HASH\n',
            '-------------------------------------------\n',
            content
        ], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthchain-audit-trail-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                        <History className="text-cyan-400 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Access History</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            Immutable audit trail on Polygon
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-3 py-1">
                        <ShieldCheck className="w-3 h-3 mr-2" />
                        Blockchain Verified
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            {showStats && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {[
                        { label: "Total", value: stats.total, color: "text-white" },
                        { label: "Viewed", value: stats.viewed, color: "text-blue-400" },
                        { label: "Approved", value: stats.recordApproved, color: "text-green-400" },
                        { label: "Rejected", value: stats.recordRejected, color: "text-rose-400" },
                        { label: "Uploaded", value: stats.uploaded, color: "text-emerald-400" },
                        { label: "Download", value: stats.downloaded, color: "text-purple-400" },
                        { label: "Granted", value: stats.accessGranted, color: "text-indigo-400" },
                        { label: "Emergency", value: stats.emergencyAccess, color: "text-amber-400" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
                        >
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search by actor, action, or details..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl text-sm"
                    />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 h-10 rounded-xl text-sm">
                        <Filter className="w-3 h-3 mr-2 text-gray-500" />
                        <SelectValue placeholder="Filter by Action" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-white/10">
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="Viewed">Viewed</SelectItem>
                        <SelectItem value="Downloaded">Downloaded</SelectItem>
                        <SelectItem value="Uploaded">Uploaded</SelectItem>
                        <SelectItem value="Access Granted">Access Granted</SelectItem>
                        <SelectItem value="Access Revoked">Access Revoked</SelectItem>
                        <SelectItem value="Record Approved">Record Approved</SelectItem>
                        <SelectItem value="Record Rejected">Record Rejected</SelectItem>
                        <SelectItem value="Emergency Access">Emergency Access</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    className="border-white/10 text-gray-400 hover:text-white h-10 px-4 rounded-xl"
                    onClick={handleExportPDF}
                >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[160px] text-[10px] font-black text-gray-400 uppercase tracking-widest">Date / Time</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actor</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[300px]">Details</TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">TX Hash</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                        <span className="text-gray-500 text-sm">Loading activity logs...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <AnimatePresence>
                                {filteredLogs.map((log, idx) => {
                                    const Icon = actionIcons[log.action] || Eye;
                                    const colorClass = actionColors[log.action] || "text-gray-400 bg-gray-400/10";

                                    return (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <TableCell className="text-gray-400 font-mono text-[11px] font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-gray-600" />
                                                    {log.date}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center border border-white/5`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <span className="text-sm">{log.actor}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${colorClass.split(' ')[0]}`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                {log.details ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <p className="text-[11px] text-gray-500 truncate cursor-help">
                                                                    {log.details}
                                                                </p>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[400px] bg-[#0A0A0A] border-white/10 text-white">
                                                                <p className="text-sm">{log.details}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-[11px] text-gray-700">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <button className="text-xs text-gray-600 hover:text-cyan-400 font-mono transition-colors flex items-center gap-2 justify-end ml-auto">
                                                    {log.txHash.substring(0, 10)}...
                                                    <ExternalLink size={12} />
                                                </button>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        )}

                        {!isLoading && filteredLogs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-600">
                                        <ShieldCheck className="w-10 h-10 mb-3 grayscale opacity-20" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">
                                            {searchTerm || actionFilter !== 'all'
                                                ? 'No logs match your filters'
                                                : 'No activity logs yet'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 italic">
                        * This log is an immutable mirror of events recorded on the Polygon network.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-gray-600 font-mono">
                            Showing {filteredLogs.length} of {logs.length} entries
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
