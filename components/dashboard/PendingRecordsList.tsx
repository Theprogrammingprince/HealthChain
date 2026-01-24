"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, User, Building2, Calendar, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PendingRecord = {
    id: string;
    doctorName: string;
    hospitalName: string;
    recordType: string;
    date: string;
    status: "Pending Patient Approval";
    notes?: string;
};

const initialPendingRecords: PendingRecord[] = [
    {
        id: "REC-PEND-001",
        doctorName: "Dr. Sarah Jenkins",
        hospitalName: "Mayo Clinic",
        recordType: "Blood Test Results",
        date: "2024-03-12",
        status: "Pending Patient Approval",
        notes: "Complete lipid panel including cholesterol and triglycerides."
    },
    {
        id: "REC-PEND-002",
        doctorName: "Dr. Gregory House",
        hospitalName: "City General",
        recordType: "MRI Scan Report",
        date: "2024-03-11",
        status: "Pending Patient Approval",
        notes: "Lumbar spine MRI showing L4-L5 disc herniation."
    }
];

export function PendingRecordsList() {
    const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>(initialPendingRecords);

    const handleApprove = (id: string) => {
        setPendingRecords(prev => prev.filter(rec => rec.id !== id));
        toast.success("Record Approved", {
            description: "The medical record has been added to your encrypted vault."
        });
    };

    const handleReject = (id: string) => {
        setPendingRecords(prev => prev.filter(rec => rec.id !== id));
        toast.error("Record Rejected", {
            description: "The sender has been notified of your rejection."
        });
    };

    if (pendingRecords.length === 0) return null;

    return (
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
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.doctorName}`} />
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-sm text-white">{record.recordType}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Building2 className="w-3 h-3 text-gray-500" />
                                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide">{record.hospitalName}</span>
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
                                        <span className="text-xs font-medium">{record.doctorName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-xs font-medium">{new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                    {record.notes && (
                                        <p className="text-[11px] text-gray-500 italic border-t border-white/5 pt-2 mt-2">
                                            "{record.notes}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
                                        variant="outline"
                                        onClick={() => handleApprove(record.id)}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                        variant="outline"
                                        onClick={() => handleReject(record.id)}
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
    );
}
