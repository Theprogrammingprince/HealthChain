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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    UserPlus,
    X,
    Check,
    Clock,
    AlertCircle,
    Building2,
    Search,
    Stethoscope,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function HospitalArrivalsTable() {
    const { supabaseSession } = useAppStore();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [hospitalId, setHospitalId] = useState<string | null>(null);

    // Review State
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadHospitalData();
    }, [supabaseSession]);

    const loadHospitalData = async () => {
        try {
            const userId = supabaseSession?.user?.id;
            if (!userId) return;

            const { data, error } = await supabase
                .from("hospital_profiles")
                .select("id")
                .eq("user_id", userId)
                .single();

            if (data) {
                setHospitalId(data.id);
                fetchRequests(data.id);
            }
        } catch (err) {
            console.error("Error loading hospital:", err);
        }
    };

    const fetchRequests = async (hId: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/hospitals/transfer-requests?hospitalId=${hId}`);
            const json = await res.json();
            if (json.success) {
                setRequests(json.data || []);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
            toast.error("Failed to load arrivals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest || !hospitalId) return;
        if (status === 'rejected' && !rejectionReason) {
            toast.error("Please provide a rejection reason");
            return;
        }

        try {
            setIsProcessing(true);
            const res = await fetch('/api/hospitals/transfer-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    action: 'review',
                    status,
                    rejectionReason: status === 'rejected' ? rejectionReason : null,
                    reviewerId: supabaseSession?.user?.id
                })
            });

            const json = await res.json();
            if (res.ok) {
                toast.success(status === 'approved' ? "Doctor transfer approved" : "Transfer request rejected");
                setSelectedRequest(null);
                setRejectionReason("");
                fetchRequests(hospitalId);
            } else {
                toast.error(json.error || "Failed to process request");
            }
        } catch (err) {
            console.error("Error processing review:", err);
            toast.error("An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const docName = `${req.doctor?.first_name} ${req.doctor?.last_name}`.toLowerCase();
        return docName.includes(searchTerm.toLowerCase()) ||
            req.doctor?.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading) {
        return <div className="p-10 text-center text-gray-500 uppercase font-black text-xs tracking-widest animate-pulse">Loading Arrivals Directory...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Clinical Arrivals</h3>
                        <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Manage incoming doctor transfers & verifications</p>
                    </div>
                </div>

                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search arrivals..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl text-xs uppercase font-bold"
                    />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Physician Info</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Origin Facility</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Arrival Type</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {filteredRequests.map((req) => (
                                <TableRow key={req.id} className="group hover:bg-white/[0.02] transition-colors border-white/5">
                                    <TableCell className="pl-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/10">
                                                <Stethoscope size={18} className="text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tight text-sm">Dr. {req.doctor?.first_name} {req.doctor?.last_name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{req.doctor?.specialty}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-gray-600" />
                                            <span className="text-xs font-bold text-gray-400">{req.from_hospital?.hospital_name || "New Registry"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-white/5 text-gray-500 border-white/10 text-[9px] font-black uppercase px-2 py-0.5">
                                            {req.from_hospital_id ? "Transfer" : "Initial Verification"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'approved' ? 'bg-emerald-500' :
                                                    req.status === 'rejected' ? 'bg-red-500' :
                                                        req.status === 'cancelled' ? 'bg-gray-500' :
                                                            'bg-amber-500 animate-pulse'
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'text-emerald-500' :
                                                    req.status === 'rejected' ? 'text-red-500' :
                                                        'text-amber-500'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        {req.status === 'pending' ? (
                                            <Button
                                                onClick={() => setSelectedRequest(req)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest h-9 px-5 rounded-lg"
                                            >
                                                Review Request
                                            </Button>
                                        ) : (
                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">Processed</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">No pending arrivals found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {/* Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-lg rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Review Clinical Arrival</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Verify the credentials and transfer request for this medical practitioner.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 py-6">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Practitioner</p>
                                        <p className="text-xl font-black text-white uppercase tracking-tight">Dr. {selectedRequest.doctor?.first_name} {selectedRequest.doctor?.last_name}</p>
                                        <p className="text-sm text-indigo-400 font-bold mt-1">{selectedRequest.doctor?.specialty}</p>
                                    </div>
                                    <Badge className="bg-indigo-500/20 text-indigo-400 border-none px-3 py-1 font-black text-[10px] uppercase">
                                        License: {selectedRequest.doctor?.medical_license_number}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">From Facility</p>
                                        <p className="text-sm font-bold text-gray-400 mt-1">{selectedRequest.from_hospital?.hospital_name || "External Registry"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Requested Date</p>
                                        <p className="text-sm font-bold text-gray-400 mt-1">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {selectedRequest.request_reason && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FileText size={12} /> Statement of Purpose
                                        </p>
                                        <p className="text-xs text-gray-400 italic leading-relaxed">
                                            "{selectedRequest.request_reason}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Rejection Reason (Required for Denial)</Label>
                                <Textarea
                                    placeholder="Explain the reason for rejection..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl min-h-[100px] focus:border-red-500 transition-all text-sm"
                                />
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-wider">
                                    Approved doctors will immediately gain read/write access to patient records associated with this clinical node.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => handleReview('rejected')}
                            disabled={isProcessing || !rejectionReason}
                            className="text-red-500 hover:text-white hover:bg-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 flex-1"
                        >
                            {isProcessing ? <Clock className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                            Deny Access
                        </Button>
                        <Button
                            onClick={() => handleReview('approved')}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest h-12 flex-1"
                        >
                            {isProcessing ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            Grant Credentials
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
