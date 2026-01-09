"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Download, ShieldCheck, Eye, Search, FileJson, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Mock Logs
const MOCK_LOGS = [
    { id: 1, timestamp: "2023-10-26 14:30:12", actor: "0x7a2...99B1", action: "EmergencyAccessRequested", target: "Patient-88219", tx: "0xabc...123" },
    { id: 2, timestamp: "2023-10-26 12:15:00", actor: "SuperAdmin", action: "HospitalWhitelisted", target: "Reddington", tx: "0xdef...456" },
    { id: 3, timestamp: "2023-10-25 09:12:44", actor: "0x3A2...B190", action: "RecordUpdated", target: "Patient-11029", tx: "0xghi...789" },
    { id: 4, timestamp: "2023-10-24 16:45:33", actor: "SuperAdmin", action: "RevokeHospital", target: "General Hospital", tx: "0xjkl...012" },
    { id: 5, timestamp: "2023-10-24 10:20:11", actor: "0x71C...9A21", action: "LoginSuccess", target: "System", tx: "-" },
];

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isGeneratingZK, setIsGeneratingZK] = useState(false);

    const filteredLogs = MOCK_LOGS.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        const csv = Papa.unparse(filteredLogs);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'healthchain_audit_logs.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Audit logs exported to CSV");
    };

    const handleGenerateZKProof = () => {
        setIsGeneratingZK(true);
        setTimeout(() => {
            setIsGeneratingZK(false);
            toast.success("Zero-Knowledge Proof Generated successfully");
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search system events..."
                        className="pl-9 bg-white/5 border-white/10 text-xs h-12 rounded-xl focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10 h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Generate ZK Report
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-md rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                                    <FileJson className="h-6 w-6 text-blue-500" />
                                    ZK Compliance Engine
                                </DialogTitle>
                                <DialogDescription className="text-gray-400 font-medium pt-2">
                                    Generate a cryptographic proof of system integrity without exposing sensitive metadata.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-8 flex flex-col items-center justify-center">
                                {isGeneratingZK ? (
                                    <div className="flex flex-col items-center">
                                        <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Computing SNARK Proof...</p>
                                    </div>
                                ) : (
                                    <div className="text-center group cursor-pointer">
                                        <div className="bg-blue-500/10 text-blue-500 p-6 rounded-3xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <ShieldCheck className="h-10 w-10" />
                                        </div>
                                        <p className="mt-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Ready</p>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleGenerateZKProof}
                                disabled={isGeneratingZK}
                                className="bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-black uppercase tracking-widest"
                            >
                                {isGeneratingZK ? "Processing..." : "Run Verification"}
                            </Button>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleExportCSV} variant="ghost" className="bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 py-5">Event Timestamp</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Authorized Actor</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operation</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Blockchain Reference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.map((log) => (
                            <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell className="text-gray-500 font-mono text-[10px] py-4">{log.timestamp}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white">{log.actor}</span>
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Verified Node</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-wider text-gray-400 py-0.5">
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {log.tx !== "-" ? (
                                        <a href="#" className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-400 transition-colors text-[10px] font-mono group">
                                            {log.tx}
                                            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-700 font-mono text-[10px]">Internal Event</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
