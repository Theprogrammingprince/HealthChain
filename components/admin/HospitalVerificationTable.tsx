"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    ShieldAlert,
    Loader2,
    FileText,
    Search,
    Building2,
    Eye,
    RefreshCw,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Globe,
    Shield,
    AlertTriangle
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

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
    country: string | null;
    postal_code: string | null;
    website: string | null;
    description: string | null;
    specialization: string | null;
    created_at: string;
    updated_at: string;
    verified_at: string | null;
    // Joined user data
    user?: {
        wallet_address: string | null;
        email: string | null;
        full_name: string | null;
    };
}

export function HospitalVerificationTable() {
    const [hospitals, setHospitals] = useState<HospitalProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [selectedHospital, setSelectedHospital] = useState<HospitalProfile | null>(null);
    const [viewHospital, setViewHospital] = useState<HospitalProfile | null>(null);
    const [viewCertificate, setViewCertificate] = useState<HospitalProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
    const [sendingEmail, setSendingEmail] = useState(false);

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
                        email,
                        full_name
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

    // Send email notification
    const sendEmailNotification = async (
        hospital: HospitalProfile,
        action: "approved" | "rejected",
        reason?: string
    ) => {
        const email = hospital.user?.email;
        if (!email) {
            console.log("No email to send notification to");
            return;
        }

        try {
            setSendingEmail(true);
            const response = await fetch("/api/email/verification-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: email,
                    hospitalName: hospital.hospital_name,
                    action,
                    reason: reason || null,
                    licenseNumber: hospital.license_number,
                    registrationNumber: hospital.registration_number,
                }),
            });

            if (response.ok) {
                toast.success(`Email notification sent to ${email}`);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Email error:", errorData);
                toast.warning("Status updated but email notification failed");
            }
        } catch (error) {
            console.error("Email send error:", error);
            toast.warning("Status updated but email notification failed");
        } finally {
            setSendingEmail(false);
        }
    };

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

            // Send email notification
            await sendEmailNotification(hospital, "approved");

            // Refresh the list
            await fetchHospitals();

            // Close view dialog if open
            if (viewHospital?.id === hospital.id) {
                setViewHospital(null);
            }
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

        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

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

            toast.error(`Access rejected for ${selectedHospital.hospital_name}`, {
                description: "Email notification sent with reason."
            });

            // Send email notification with reason
            await sendEmailNotification(selectedHospital, "rejected", rejectReason);

            setRejectReason("");
            setSelectedHospital(null);

            // Close view dialog if open
            if (viewHospital?.id === selectedHospital.id) {
                setViewHospital(null);
            }

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
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
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
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contact</TableHead>
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
                                                    {hospital.city && hospital.state ? `${hospital.city}, ${hospital.state}` : "Location not set"}
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
                                            <span className="text-[10px] text-gray-600 font-mono block">
                                                CAC: {hospital.registration_number || "N/A"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {hospital.user?.email ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-gray-500" />
                                                    <span className="text-xs text-gray-400">{hospital.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {truncateAddress(hospital.user?.wallet_address || null)}
                                                </span>
                                            )}
                                            {hospital.phone_number && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-gray-500" />
                                                    <span className="text-[10px] text-gray-600">{hospital.phone_number}</span>
                                                </div>
                                            )}
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
                                            {/* View Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                                onClick={() => setViewHospital(hospital)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>

                                            {hospital.verification_status === "pending" && (
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
                                            )}

                                            {hospital.verification_status === "verified" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-red-500/60 hover:text-red-400 hover:bg-red-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                                    onClick={() => setSelectedHospital(hospital)}
                                                >
                                                    Revoke
                                                </Button>
                                            )}

                                            {hospital.verification_status === "rejected" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 font-bold text-[10px] uppercase tracking-widest rounded-xl"
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

            {/* View Hospital Details Dialog */}
            <Dialog open={!!viewHospital} onOpenChange={(open) => !open && setViewHospital(null)}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-3xl sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white text-xl font-black">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                                <Building2 className="h-5 w-5 text-blue-500" />
                            </div>
                            {viewHospital?.hospital_name}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 mt-2">
                            Complete hospital profile and verification details
                        </DialogDescription>
                    </DialogHeader>

                    {viewHospital && (
                        <div className="space-y-6 py-4">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-xl border flex items-center gap-3 ${viewHospital.verification_status === "verified"
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : viewHospital.verification_status === "rejected"
                                        ? "bg-red-500/10 border-red-500/20"
                                        : "bg-yellow-500/10 border-yellow-500/20"
                                }`}>
                                {viewHospital.verification_status === "verified" ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : viewHospital.verification_status === "rejected" ? (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                )}
                                <div>
                                    <p className={`font-bold text-sm ${viewHospital.verification_status === "verified"
                                            ? "text-emerald-400"
                                            : viewHospital.verification_status === "rejected"
                                                ? "text-red-400"
                                                : "text-yellow-400"
                                        }`}>
                                        {viewHospital.verification_status === "verified"
                                            ? "Verified Hospital"
                                            : viewHospital.verification_status === "rejected"
                                                ? "Verification Rejected"
                                                : "Pending Verification"}
                                    </p>
                                    {viewHospital.verified_at && (
                                        <p className="text-xs text-gray-500">Verified on {formatDate(viewHospital.verified_at)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Info */}
                                <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Basic Information
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Hospital Name</Label>
                                            <p className="text-sm text-white font-medium">{viewHospital.hospital_name}</p>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Specialization</Label>
                                            <p className="text-sm text-white">{viewHospital.specialization || "General Practice"}</p>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Description</Label>
                                            <p className="text-sm text-gray-400">{viewHospital.description || "No description provided"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* License Info */}
                                <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        License & Registration
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">MDCN License Number</Label>
                                            <p className="text-sm text-white font-mono">{viewHospital.license_number || "N/A"}</p>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">CAC Registration</Label>
                                            <p className="text-sm text-white font-mono">{viewHospital.registration_number || "N/A"}</p>
                                        </div>

                                        {viewHospital.license_path && (
                                            <div>
                                                <Label className="text-[10px] text-gray-500 uppercase">Certificate</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-1 h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                    onClick={() => {
                                                        setViewHospital(null);
                                                        setViewCertificate(viewHospital);
                                                    }}
                                                >
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    View Certificate
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Contact Information
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Email</Label>
                                            <p className="text-sm text-white">{viewHospital.user?.email || "No email"}</p>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Phone</Label>
                                            <p className="text-sm text-white">{viewHospital.phone_number || "No phone"}</p>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Wallet Address</Label>
                                            <p className="text-xs text-gray-400 font-mono break-all">
                                                {viewHospital.user?.wallet_address || viewHospital.user_id}
                                            </p>
                                        </div>

                                        {viewHospital.website && (
                                            <div>
                                                <Label className="text-[10px] text-gray-500 uppercase">Website</Label>
                                                <a
                                                    href={viewHospital.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    {viewHospital.website}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Location
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] text-gray-500 uppercase">Address</Label>
                                            <p className="text-sm text-white">{viewHospital.address || "No address"}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-[10px] text-gray-500 uppercase">City</Label>
                                                <p className="text-sm text-white">{viewHospital.city || "N/A"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-gray-500 uppercase">State</Label>
                                                <p className="text-sm text-white">{viewHospital.state || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-[10px] text-gray-500 uppercase">Country</Label>
                                                <p className="text-sm text-white">{viewHospital.country || "Nigeria"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-gray-500 uppercase">Postal Code</Label>
                                                <p className="text-sm text-white">{viewHospital.postal_code || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4" />
                                    Timeline
                                </h4>
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500">Submitted:</span>
                                        <span className="ml-2 text-white">{formatDate(viewHospital.created_at)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Last Updated:</span>
                                        <span className="ml-2 text-white">{formatDate(viewHospital.updated_at)}</span>
                                    </div>
                                    {viewHospital.verified_at && (
                                        <div>
                                            <span className="text-gray-500">Verified:</span>
                                            <span className="ml-2 text-emerald-400">{formatDate(viewHospital.verified_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 pt-4 border-t border-white/10">
                        <Button
                            variant="ghost"
                            onClick={() => setViewHospital(null)}
                            className="flex-1 h-11 rounded-xl text-gray-400 font-bold"
                        >
                            Close
                        </Button>

                        {viewHospital?.verification_status === "pending" && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedHospital(viewHospital);
                                    }}
                                    className="flex-1 h-11 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => viewHospital && handleVerify(viewHospital)}
                                    disabled={actionLoading === viewHospital?.id}
                                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl"
                                >
                                    {actionLoading === viewHospital?.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!selectedHospital} onOpenChange={(open) => !open && setSelectedHospital(null)}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-3xl sm:max-w-[500px]">
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
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Reason for {selectedHospital?.verification_status === "verified" ? "Revocation" : "Rejection"} *
                            </Label>
                            <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a clear reason. This will be sent to the hospital via email..."
                                className="bg-white/5 border-white/10 text-white rounded-xl min-h-[120px] resize-none"
                            />
                            <p className="text-[10px] text-gray-500">
                                This reason will be included in the email notification sent to {selectedHospital?.user?.email || "the hospital"}
                            </p>
                        </div>

                        {selectedHospital?.user?.email && (
                            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Mail className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-blue-300">
                                    Email will be sent to: <strong>{selectedHospital.user.email}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedHospital(null);
                                setRejectReason("");
                            }}
                            className="flex-1 h-12 rounded-xl text-gray-400 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || actionLoading === selectedHospital?.id || sendingEmail}
                            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl"
                        >
                            {actionLoading === selectedHospital?.id || sendingEmail ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Confirm & Send Email"
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
