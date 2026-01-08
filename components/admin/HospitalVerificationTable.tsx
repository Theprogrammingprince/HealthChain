"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ExternalLink, ShieldAlert, Loader2, FileText, Check, X } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";

export function HospitalVerificationTable() {
    const { verificationRequests, verifyHospital, rejectHospital } = useAppStore();
    const [loading, setLoading] = useState<string | null>(null);
    const [revokeReason, setRevokeReason] = useState("");
    const [selectedHospital, setSelectedHospital] = useState<any>(null);

    const handleVerify = async (id: string, name: string) => {
        setLoading(id);
        try {
            // Simulate on-chain delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            verifyHospital(id);
            toast.success(`${name} whitelisted successfully`);
        } catch (error) {
            toast.error("Chain interaction failed");
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedHospital) return;
        setLoading(selectedHospital.id);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            rejectHospital(selectedHospital.id);
            toast.error(`Access revoked for ${selectedHospital.name}`);
            setRevokeReason("");
            setSelectedHospital(null);
        } catch (error) {
            toast.error("Failed to update registry");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Registry Queue</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Pending Administrative Validations</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Input placeholder="Filter by address..." className="bg-white/5 border-white/10 text-xs h-10 pl-9 rounded-xl focus:ring-blue-500/20" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    </div>
                </div>
            </div>

            <Table>
                <TableHeader className="bg-white/[0.01]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 py-5">Entity Information</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">License Reference</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Node Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Administrative Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {verificationRequests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center">
                                <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">No pending applications found</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        verificationRequests.map((hospital) => (
                            <TableRow key={hospital.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell className="py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">{hospital.name}</span>
                                        <span className="text-[10px] text-gray-500 font-mono mt-0.5 tracking-tighter">{hospital.address}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 font-mono">{hospital.license}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {hospital.status === "Verified" && (
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Authenticated</span>
                                        </div>
                                    )}
                                    {hospital.status === "Pending" && (
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Awaiting KYC</span>
                                        </div>
                                    )}
                                    {hospital.status === "Rejected" && (
                                        <div className="flex items-center gap-2 text-red-500">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Access Revoked</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {hospital.status === "Pending" ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-red-500 hover:text-red-400 hover:bg-red-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                                    onClick={() => {
                                                        setSelectedHospital(hospital);
                                                    }}
                                                >
                                                    Deny
                                                </Button>
                                                <Button
                                                    disabled={loading === hospital.id}
                                                    size="sm"
                                                    className="h-9 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20"
                                                    onClick={() => handleVerify(hospital.id, hospital.name)}
                                                >
                                                    {loading === hospital.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        "Authorize"
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-4 text-gray-500 hover:text-white hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                            >
                                                Audit Trail
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Revoke Dialog */}
            <Dialog open={!!selectedHospital} onOpenChange={(open) => !open && setSelectedHospital(null)}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-3xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-red-500 text-xl font-black uppercase">
                            <ShieldAlert className="h-6 w-6" />
                            Security Protocol
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium pt-2">
                            You are about to revoke registry access for <span className="text-white font-bold">{selectedHospital?.name}</span>. This will immediately terminate their clinical entry permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reason for Revocation</label>
                            <Input
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder="Compliance breach, expired license, etc."
                                className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setSelectedHospital(null)} className="flex-1 h-12 rounded-xl text-gray-400 font-bold">CANCEL</Button>
                        <Button
                            onClick={handleReject}
                            disabled={!revokeReason || loading === selectedHospital?.id}
                            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl"
                        >
                            {loading === selectedHospital?.id ? "EXECUTING..." : "CONFIRM REVOKE"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { Search } from "lucide-react";
