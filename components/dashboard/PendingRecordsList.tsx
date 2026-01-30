"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, User, Building2, Calendar, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import {
    getPatientPendingApprovals,
    approveRecordAsPatient,
    rejectRecordAsPatient,
    logPatientRecordApproval,
    logPatientRecordRejection
} from "@/lib/database.service";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type PendingRecord = {
    id: string;
    submission_code: string;
    doctor_name: string;
    hospital_name: string;
    record_type: string;
    record_title: string;
    record_description: string | null;
    created_at: string;
    overall_status: string;
};

export function PendingRecordsList() {
    const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const { supabaseUser } = useAppStore();

    useEffect(() => {
        if (supabaseUser?.id) {
            loadPendingRecords();
        }
    }, [supabaseUser?.id]);

    const loadPendingRecords = async () => {
        if (!supabaseUser?.id) return;

        setIsLoading(true);
        try {
            const records = await getPatientPendingApprovals(supabaseUser.id);
            setPendingRecords(records as PendingRecord[]);
        } catch (error) {
            console.error("Error loading pending records:", error);
            toast.error("Failed to load pending approvals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!supabaseUser?.id) return;

        // Find the record to get details for logging
        const record = pendingRecords.find(r => r.id === id);
        if (!record) return;

        setProcessingId(id);
        try {
            await approveRecordAsPatient(id, supabaseUser.id);

            // Log activity
            await logPatientRecordApproval(
                supabaseUser.id,
                supabaseUser.full_name || 'Patient',
                record.record_title,
                record.doctor_name
            );

            setPendingRecords(prev => prev.filter(rec => rec.id !== id));
            toast.success("Record Approved", {
                description: "The medical record has been added to your encrypted vault."
            });
        } catch (error) {
            console.error("Error approving record:", error);
            toast.error("Failed to approve record");
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectDialog = (id: string) => {
        setSelectedRecordId(id);
        setRejectionReason("");
        setRejectDialogOpen(true);
    };

    const handleReject = async () => {
        if (!supabaseUser?.id || !selectedRecordId) return;

        // Find the record to get details for logging
        const record = pendingRecords.find(r => r.id === selectedRecordId);
        if (!record) return;

        setProcessingId(selectedRecordId);
        try {
            await rejectRecordAsPatient(selectedRecordId, supabaseUser.id, rejectionReason);

            // Log activity
            await logPatientRecordRejection(
                supabaseUser.id,
                supabaseUser.full_name || 'Patient',
                record.record_title,
                record.doctor_name,
                rejectionReason
            );

            setPendingRecords(prev => prev.filter(rec => rec.id !== selectedRecordId));
            toast.error("Record Rejected", {
                description: "The sender has been notified of your rejection."
            });
            setRejectDialogOpen(false);
        } catch (error) {
            console.error("Error rejecting record:", error);
            toast.error("Failed to reject record");
        } finally {
            setProcessingId(null);
            setSelectedRecordId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="ml-2 text-gray-400 text-sm">Loading pending approvals...</span>
            </div>
        );
    }

    if (pendingRecords.length === 0) return null;

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 animate-pulse">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Pending Approvals</h3>
                        <p className="text-xs text-gray-400">Doctors have submitted the following records for your review</p>
                    </div>
                    <Badge variant="outline" className="ml-auto border-indigo-500/50 text-indigo-400 bg-indigo-500/5">
                        {pendingRecords.length} Action{pendingRecords.length !== 1 ? 's' : ''} Required
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {pendingRecords.map((record) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                                className="bg-white/5 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FileText className="w-16 h-16 text-indigo-500" />
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-white/10">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.doctor_name}`} />
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-sm text-white">{record.record_title}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Building2 className="w-3 h-3 text-gray-500" />
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide">{record.hospital_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-500/10 text-blue-400 border-none text-[9px] uppercase font-black">
                                            Action Required
                                        </Badge>
                                    </div>

                                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                                            <User className="w-3 h-3" />
                                            <span className="text-xs font-medium">{record.doctor_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-xs font-medium">{new Date(record.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                                            <FileText className="w-3 h-3" />
                                            <span className="text-xs font-medium">{record.record_type}</span>
                                        </div>
                                        {record.record_description && (
                                            <p className="text-[11px] text-gray-500 italic border-t border-white/5 pt-2 mt-2">
                                                &quot;{record.record_description}&quot;
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-mono text-gray-600">
                                                ID: {record.submission_code}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
                                            variant="outline"
                                            onClick={() => handleApprove(record.id)}
                                            disabled={processingId === record.id}
                                        >
                                            {processingId === record.id ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            Approve
                                        </Button>
                                        <Button
                                            className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                            variant="outline"
                                            onClick={() => openRejectDialog(record.id)}
                                            disabled={processingId === record.id}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Rejection Reason Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="bg-[#0A0A0A] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Reject Medical Record</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Please provide a reason for rejecting this record. This will be sent to the doctor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter rejection reason (optional)..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectDialogOpen(false)}
                            className="border-white/10 text-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={processingId !== null}
                            className="bg-red-600 hover:bg-red-500 text-white"
                        >
                            {processingId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <X className="w-4 h-4 mr-2" />
                            )}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
