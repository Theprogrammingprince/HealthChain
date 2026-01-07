"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Download, ShieldCheck, Eye, Search, FileJson } from "lucide-react";
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
        // Simulate complex calculation
        setTimeout(() => {
            setIsGeneratingZK(false);
            toast.success("Zero-Knowledge Proof Generated successfully on-chain verification");
        }, 3000);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search logs by actor, action, or target..."
                        className="pl-9 bg-gray-900 border-gray-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-[#00BFFF]/30 text-[#00BFFF] hover:bg-[#00BFFF]/10 gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Generate Anonymous Report (ZK)
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileJson className="h-5 w-5 text-[#00BFFF]" />
                                    Zero-Knowledge Compliance Report
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Generate a cryptographic proof that all system operations complied with privacy rules (HIPAA/NDPR) without revealing patient data.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 flex flex-col items-center justify-center space-y-4">
                                {isGeneratingZK ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <div className="h-12 w-12 rounded-full border-4 border-[#00BFFF] border-t-transparent animate-spin mb-4" />
                                        <p className="text-sm text-gray-400">Computing ZK-SNARK circuit...</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2">
                                        <div className="bg-[#10B981]/10 text-[#10B981] p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                            <ShieldCheck className="h-8 w-8" />
                                        </div>
                                        <p className="text-sm text-gray-300">System State Validated</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                {!isGeneratingZK && (
                                    <Button onClick={handleGenerateZKProof} className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-white w-full">
                                        Run Verification Simulation
                                    </Button>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleExportCSV} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-950">
                        <TableRow className="border-gray-800 hover:bg-gray-950">
                            <TableHead className="text-gray-400">Timestamp</TableHead>
                            <TableHead className="text-gray-400">Actor</TableHead>
                            <TableHead className="text-gray-400">Action</TableHead>
                            <TableHead className="text-gray-400">Target / Hash</TableHead>
                            <TableHead className="text-gray-400 text-right">Transaction Log</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.map((log) => (
                            <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/50">
                                <TableCell className="text-gray-400 font-mono text-xs">{log.timestamp}</TableCell>
                                <TableCell className="text-white font-medium">{log.actor}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-gray-700 text-gray-300">
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400 font-mono text-xs">{log.target}</TableCell>
                                <TableCell className="text-right">
                                    {log.tx !== "-" && (
                                        <a href="#" className="inline-flex items-center gap-1 text-[#00BFFF] hover:underline text-xs">
                                            {log.tx} <ExternalLink className="h-3 w-3" />
                                        </a>
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

function ExternalLink({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    )
}
