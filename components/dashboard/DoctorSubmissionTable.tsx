"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, FileText, User, Loader2, AlertCircle, Clock, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import {
    getHospitalPendingReviews,
    getAllHospitalSubmissions,
    approveRecordAsHospital,
    rejectRecordAsHospital,
    logHospitalRecordApproval,
    logHospitalRecordRejection,
} from "@/lib/database.service";

type Submission = {
    id: string;
    submission_code: string;
    doctor_name: string;
    patient_name: string;
    record_type: string;
    record_title: string;
    record_description: string | null;
    overall_status: string;
    hospital_approval_status: string;
    created_at: string;
};

export function DoctorSubmissionTable() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [hospitalName, setHospitalName] = useState<string>('Hospital');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Rejection dialog state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const { supabaseSession } = useAppStore();

    useEffect(() => {
        loadHospitalData();
    }, [supabaseSession]);

    const loadHospitalData = async () => {
        try {
            const userId = supabaseSession?.user?.id;
            if (!userId) return;

            const { data, error } = await supabase
                .from("hospital_profiles")
                .select("id, hospital_name")
                .eq("user_id", userId)
                .single();

            if (data) {
                setHospitalId(data.id);
                setHospitalName(data.hospital_name || 'Hospital');
                loadSubmissions(data.id);
            }
        } catch (err) {
            console.error("Error loading hospital:", err);
        }
    };

    const loadSubmissions = async (hId: string) => {
        setIsLoading(true);
        try {
            const records = await getAllHospitalSubmissions(hId);
            setSubmissions(records as Submission[]);
        } catch (error) {
            console.error("Error loading submissions:", error);
            toast.error("Failed to load submissions");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (submission: Submission) => {
        if (!hospitalId || !supabaseSession?.user?.id) return;

        setProcessingId(submission.id);
        try {
            await approveRecordAsHospital(
                submission.id,
                hospitalId,
                supabaseSession.user.id
            );

            // Log activity
            await logHospitalRecordApproval(
                supabaseSession.user.id,
                hospitalName,
                submission.record_title,
                submission.doctor_name,
                (submission as any).patient_id || ''
            );

            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.id === submission.id
                    ? { ...s, overall_status: 'pending_patient_approval', hospital_approval_status: 'approved' }
                    : s
            ));

            toast.success("Submission Approved", {
                description: "Record forwarded to patient for final consent."
            });
        } catch (error) {
            console.error("Error approving submission:", error);
            toast.error("Failed to approve submission");
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectDialog = (submission: Submission) => {
        setSelectedSubmission(submission);
        setRejectionReason("");
        setRejectDialogOpen(true);
    };

    const handleReject = async () => {
        if (!hospitalId || !supabaseSession?.user?.id || !selectedSubmission) return;

        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setProcessingId(selectedSubmission.id);
        try {
            await rejectRecordAsHospital(
                selectedSubmission.id,
                hospitalId,
                supabaseSession.user.id,
                rejectionReason
            );

            // Log activity
            await logHospitalRecordRejection(
                supabaseSession.user.id,
                hospitalName,
                selectedSubmission.record_title,
                selectedSubmission.doctor_name,
                (selectedSubmission as any).patient_id || '',
                rejectionReason
            );

            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.id === selectedSubmission.id
                    ? { ...s, overall_status: 'rejected', hospital_approval_status: 'rejected' }
                    : s
            ));

            toast.error("Submission Rejected", {
                description: "Doctor has been notified."
            });
            setRejectDialogOpen(false);
        } catch (error) {
            console.error("Error rejecting submission:", error);
            toast.error("Failed to reject submission");
        } finally {
            setProcessingId(null);
            setSelectedSubmission(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_hospital_review':
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase font-black px-2 py-0.5">Pending Review</Badge>;
            case 'pending_patient_approval':
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] uppercase font-black px-2 py-0.5">Awaiting Patient</Badge>;
            case 'approved':
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0.5">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] uppercase font-black px-2 py-0.5">Rejected</Badge>;
            default:
                return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-[9px] uppercase font-black px-2 py-0.5">{status}</Badge>;
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch =
            sub.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.record_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.submission_code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || sub.overall_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const pendingCount = submissions.filter(s => s.overall_status === 'pending_hospital_review').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="ml-2 text-gray-400 text-sm">Loading submissions...</span>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Incoming Clinical Records</h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Review and validate doctor submissions</p>
                            </div>
                            {pendingCount > 0 && (
                                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-bold ml-2">
                                    {pendingCount} Pending
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search submissions..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl text-xs"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 bg-white/5 border-white/10 h-10 rounded-xl text-xs">
                                    <Filter className="w-3 h-3 mr-2 text-gray-500" />
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/10">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending_hospital_review">Pending Review</SelectItem>
                                    <SelectItem value="pending_patient_approval">Awaiting Patient</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/5 hover:bg-white/5">
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12 pl-6">Doctor</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Patient</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Record</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Submitted</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Status</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubmissions.map((submission) => (
                                <TableRow key={submission.id} className="border-white/5 hover:bg-white/5 group">
                                    <TableCell className="font-medium text-white pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border border-white/10">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.doctor_name}`} />
                                                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{submission.doctor_name}</span>
                                                <span className="text-[9px] text-gray-500 font-mono">{submission.submission_code}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-300">{submission.patient_name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-300">{submission.record_title}</span>
                                            <span className="text-[10px] text-gray-500">{submission.record_type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {new Date(submission.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(submission.overall_status)}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        {submission.overall_status === "pending_hospital_review" ? (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
                                                    onClick={() => handleApprove(submission)}
                                                    disabled={processingId === submission.id}
                                                >
                                                    {processingId === submission.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    <span className="sr-only">Approve</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500"
                                                    onClick={() => openRejectDialog(submission)}
                                                    disabled={processingId === submission.id}
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="sr-only">Reject</span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                                                {submission.overall_status === 'pending_patient_approval' ? 'Forwarded' : 'Processed'}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSubmissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-600">
                                            <FileText className="w-10 h-10 opacity-30" />
                                            <p className="font-bold uppercase tracking-widest text-[10px]">
                                                {searchTerm || statusFilter !== 'all'
                                                    ? 'No submissions match your filters'
                                                    : 'No submissions yet'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Rejection Reason Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-lg rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Reject Submission
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Please provide a reason for rejecting this record. The doctor will be notified.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-4 py-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Record</p>
                                        <p className="text-white font-medium">{selectedSubmission.record_title}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Doctor</p>
                                        <p className="text-white font-medium">{selectedSubmission.doctor_name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    placeholder="Explain the reason for rejection..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl min-h-[100px] focus:border-red-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setRejectDialogOpen(false)}
                            className="rounded-xl font-bold text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={processingId !== null || !rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-6"
                        >
                            {processingId ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
