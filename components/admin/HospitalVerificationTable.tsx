"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink, ShieldAlert, Loader2, FileText, Search, Building2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface HospitalProfile {
    id: string;
    user_id: string;
    hospital_name: string;
    license_number: string | null;
    registration_number: string | null;
    license_path: string | null;
    verification_status: "pending" | "verified" | "rejected";
    is_verified: boolean;
    phone_number: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    created_at: string;
    updated_at: string;
    // Joined user data
    user?: {
        wallet_address: string | null;
        email: string | null;
    };
}

export function HospitalVerificationTable() {
    const [hospitals, setHospitals] = useState<HospitalProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [revokeReason, setRevokeReason] = useState("");
    const [selectedHospital, setSelectedHospital] = useState<HospitalProfile | null>(null);
    const [viewCertificate, setViewCertificate] = useState<HospitalProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

    // Fetch hospitals from database
    const fetchHospitals = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("hospital_profiles")
                .select(`
                    *,
                    user:users!hospital_profiles_user_id_fkey (
                        wallet_address,
                        email
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching hospitals:", error);
                toast.error("Failed to fetch hospital data");
                return;
            }

            setHospitals(data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    // Filter hospitals based on search and status
    const filteredHospitals = hospitals.filter((hospital) => {
        const matchesSearch =
            hospital.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.user?.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || hospital.verification_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Verify a hospital
    const handleVerify = async (hospital: HospitalProfile) => {
        setActionLoading(hospital.id);
        try {
            const { error } = await supabase
                .from("hospital_profiles")
                .update({
                    verification_status: "verified",
                    is_verified: true,
                    verified_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", hospital.id);

            if (error) {
                console.error("Verification error:", error);
                toast.error("Failed to verify hospital");
                return;
            }

            toast.success(`${hospital.hospital_name} has been verified!`, {
                description: "They can now access the clinical dashboard."
            });

            // Refresh the list
            await fetchHospitals();
        } catch (error) {
            console.error("Verify error:", error);
            toast.error("Failed to update verification status");
        } finally {
            setActionLoading(null);
        }
    };

    // Reject a hospital
    const handleReject = async () => {
        if (!selectedHospital) return;

        setActionLoading(selectedHospital.id);
        try {
            const { error } = await supabase
                .from("hospital_profiles")
                .update({
                    verification_status: "rejected",
                    is_verified: false,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", selectedHospital.id);

            if (error) {
                console.error("Rejection error:", error);
                toast.error("Failed to reject hospital");
                return;
            }

            toast.error(`Access revoked for ${selectedHospital.hospital_name}`, {
                description: revokeReason || "No reason provided"
            });

            setRevokeReason("");
            setSelectedHospital(null);

            // Refresh the list
            await fetchHospitals();
        } catch (error) {
            console.error("Reject error:", error);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Truncate wallet address
    const truncateAddress = (address: string | null) => {
        if (!address) return "N/A";
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    // Status counts
    const statusCounts = {
        all: hospitals.length,
        pending: hospitals.filter(h => h.verification_status === "pending").length,
        verified: hospitals.filter(h => h.verification_status === "verified").length,
        rejected: hospitals.filter(h => h.verification_status === "rejected").length,
    };

    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Hospital Verification Queue
                    </h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {statusCounts.pending} pending • {statusCounts.verified} verified • {statusCounts.rejected} rejected
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
                        {(["all", "pending", "verified", "rejected"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors capitalize ${statusFilter === status
                                        ? "bg-white/10 text-white border border-white/10"
                                        : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                {status} ({statusCounts[status]})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search hospitals..."
                            className="bg-white/5 border-white/10 text-xs h-10 pl-9 rounded-xl focus:ring-blue-500/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    </div>

                    {/* Refresh Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchHospitals}
                        disabled={loading}
                        className="h-10 px-3 text-gray-400 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-lg bg-white/5" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3 bg-white/5" />
                                <Skeleton className="h-3 w-1/4 bg-white/5" />
                            </div>
                            <Skeleton className="h-8 w-24 bg-white/5" />
                        </div>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 py-5">Hospital Info</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">License / CAC</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Wallet / Contact</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Submitted</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredHospitals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 className="w-10 h-10 text-gray-600" />
                                        <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">
                                            No hospitals found
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {searchTerm ? "Try adjusting your search" : "Waiting for hospital registrations"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHospitals.map((hospital) => (
                                <TableRow key={hospital.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                                                <Building2 className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-white block">{hospital.hospital_name}</span>
                                                <span className="text-[10px] text-gray-500">
                                                    {hospital.city && hospital.state ? `${hospital.city}, ${hospital.state}` : "Location not provided"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3 h-3 text-blue-500" />
                                                <span className="text-xs font-mono text-gray-400">
                                                    {hospital.license_number || "N/A"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-mono">
                                                CAC: {hospital.registration_number || "N/A"}
                                            </span>
                                            {hospital.license_path && (
                                                <button
                                                    onClick={() => setViewCertificate(hospital)}
                                                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 mt-1"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    View Certificate
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <span className="text-xs font-mono text-gray-400 block">
                                                {truncateAddress(hospital.user?.wallet_address || null)}
                                            </span>
                                            <span className="text-[10px] text-gray-600">
                                                {hospital.user?.email || hospital.phone_number || "No contact"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={hospital.verification_status} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {formatDate(hospital.created_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hospital.verification_status === "pending" ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-4 text-red-500 hover:text-red-400 hover:bg-red-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                                        onClick={() => setSelectedHospital(hospital)}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        disabled={actionLoading === hospital.id}
                                                        size="sm"
                                                        className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20"
                                                        onClick={() => handleVerify(hospital)}
                                                    >
                                                        {actionLoading === hospital.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            "Approve"
                                                        )}
                                                    </Button>
                                                </>
                                            ) : hospital.verification_status === "verified" ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-red-500/60 hover:text-red-400 hover:bg-red-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                                    onClick={() => setSelectedHospital(hospital)}
                                                >
                                                    Revoke
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-blue-500 hover:text-blue-400 hover:bg-blue-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                                    onClick={() => handleVerify(hospital)}
                                                    disabled={actionLoading === hospital.id}
                                                >
                                                    {actionLoading === hospital.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        "Re-verify"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            )}

            {/* Revoke/Reject Dialog */}
            <Dialog open={!!selectedHospital} onOpenChange={(open) => !open && setSelectedHospital(null)}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-3xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-red-500 text-xl font-black uppercase">
                            <ShieldAlert className="h-6 w-6" />
                            {selectedHospital?.verification_status === "verified" ? "Revoke Access" : "Reject Application"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium pt-2">
                            You are about to {selectedHospital?.verification_status === "verified" ? "revoke access for" : "reject the application from"}{" "}
                            <span className="text-white font-bold">{selectedHospital?.hospital_name}</span>.
                            {selectedHospital?.verification_status === "verified" && " This will immediately terminate their clinical dashboard access."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Reason (Optional)
                            </label>
                            <Input
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                placeholder="Invalid license, compliance issue, etc."
                                className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedHospital(null)}
                            className="flex-1 h-12 rounded-xl text-gray-400 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={actionLoading === selectedHospital?.id}
                            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl"
                        >
                            {actionLoading === selectedHospital?.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Certificate Dialog */}
            <Dialog open={!!viewCertificate} onOpenChange={(open) => !open && setViewCertificate(null)}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-3xl sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white text-xl font-black">
                            <FileText className="h-6 w-6 text-blue-500" />
                            {viewCertificate?.hospital_name} - Certificate
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {viewCertificate?.license_path && (
                            <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                {viewCertificate.license_path.toLowerCase().endsWith('.pdf') ? (
                                    <div className="p-8 text-center">
                                        <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400 mb-4">PDF Document</p>
                                        <a
                                            href={viewCertificate.license_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-sm transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open PDF
                                        </a>
                                    </div>
                                ) : (
                                    <img
                                        src={viewCertificate.license_path}
                                        alt="Certificate"
                                        className="w-full h-auto max-h-[400px] object-contain"
                                    />
                                )}
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <a
                                href={viewCertificate?.license_path || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open in new tab
                            </a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "verified") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20">
                <CheckCircle size={10} />
                Verified
            </span>
        );
    }
    if (status === "rejected") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase border border-red-500/20">
                <XCircle size={10} />
                Rejected
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase border border-yellow-500/20">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
            Pending
        </span>
    );
}
