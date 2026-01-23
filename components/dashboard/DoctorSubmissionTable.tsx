"use client";

import { useState } from "react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X, FileText, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Mock Data
type Submission = {
    id: string;
    doctorName: string;
    hospitalAffiliation: string;
    patientId: string;
    recordType: string;
    submittedAt: string;
    status: "Pending Hospital Review" | "Pending Patient Approval" | "Approved" | "Rejected";
};

const initialSubmissions: Submission[] = [
    {
        id: "SUB-001",
        doctorName: "Dr. Sarah Jenkins",
        hospitalAffiliation: "Mayo Clinic",
        patientId: "p_1023",
        recordType: "Lab Result",
        submittedAt: "2024-03-10T14:30:00Z",
        status: "Pending Hospital Review",
    },
    {
        id: "SUB-002",
        doctorName: "Dr. Sarah Jenkins",
        hospitalAffiliation: "Mayo Clinic",
        patientId: "p_8291",
        recordType: "Prescription",
        submittedAt: "2024-03-09T09:15:00Z",
        status: "Pending Patient Approval",
    },
    {
        id: "SUB-003",
        doctorName: "Dr. Gregory House",
        hospitalAffiliation: "City General",
        patientId: "p_4421",
        recordType: "Imaging",
        submittedAt: "2024-03-08T11:20:00Z",
        status: "Pending Hospital Review",
    },
];

export function DoctorSubmissionTable() {
    const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

    const handleApprove = (id: string) => {
        setSubmissions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, status: "Pending Patient Approval" } : sub
        ));
        toast.success("Submission Approved", {
            description: "Record forwarded to patient for final consent."
        });
    };

    const handleReject = (id: string) => {
        setSubmissions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, status: "Rejected" } : sub
        ));
        toast.error("Submission Rejected", {
            description: "Doctor has been notified."
        });
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white">Incoming Clinical Records</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Review and validate external submissions</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-white/5">
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Doctor</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Patient ID</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Record Type</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Submitted</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Status</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission) => (
                            <TableRow key={submission.id} className="border-white/5 hover:bg-white/5 group">
                                <TableCell className="font-medium text-white">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8 border border-white/10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.doctorName}`} />
                                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span>{submission.doctorName}</span>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">{submission.hospitalAffiliation}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-indigo-400">{submission.patientId}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-white/5 text-gray-400">
                                            <FileText className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm text-gray-300">{submission.recordType}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <StatusBadge status={submission.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    {submission.status === "Pending Hospital Review" ? (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
                                                onClick={() => handleApprove(submission.id)}
                                            >
                                                <Check className="w-4 h-4" />
                                                <span className="sr-only">Approve</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500"
                                                onClick={() => handleReject(submission.id)}
                                            >
                                                <X className="w-4 h-4" />
                                                <span className="sr-only">Reject</span>
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                                            <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                        </Button>
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
