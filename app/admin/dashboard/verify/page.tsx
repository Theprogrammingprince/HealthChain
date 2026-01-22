"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    CheckCircle2,
    XCircle,
    ExternalLink,
    Shield,
    Clock,
    Building2,
    FileText,
} from "lucide-react";
import { toast } from "sonner";

interface HospitalVerificationRequest {
    id: string;
    user_id: string;
    hospital_name: string;
    registration_number: string;
    license_number: string;
    license_path: string;
    verification_status: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export default function AdminVerifyPage() {
    const router = useRouter();
    const { supabaseSession, userRole } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<HospitalVerificationRequest[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        checkAdminAccess();
        fetchVerificationRequests();
    }, [supabaseSession]);

    const checkAdminAccess = async () => {
        if (!supabaseSession?.user) {
            router.push("/");
            return;
        }

        // Check if user is superadmin
        const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", supabaseSession.user.id)
            .single();

        if (error || userData?.role !== "superadmin") {
            toast.error("Access denied. Superadmin role required.");
            router.push("/");
        }
    };

    const fetchVerificationRequests = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("hospital_profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching requests:", error);
                toast.error("Failed to load verification requests");
                return;
            }

            setRequests(data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while loading data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (request: HospitalVerificationRequest) => {
        setProcessingId(request.id);

        try {
            // Update hospital profile
            const { error: profileError } = await supabase
                .from("hospital_profiles")
                .update({
                    is_verified: true,
                    verification_status: "verified",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", request.id);

            if (profileError) {
                console.error("Profile update error:", profileError);
                toast.error("Failed to approve hospital");
                setProcessingId(null);
                return;
            }

            // Update user role to hospital (if not already)
            const { error: userError } = await supabase
                .from("users")
                .update({ role: "hospital" })
                .eq("id", request.user_id);

            if (userError) {
                console.error("User update error:", userError);
            }

            toast.success(`${request.hospital_name} has been verified!`);
            await fetchVerificationRequests();
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("An error occurred during approval");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: HospitalVerificationRequest) => {
        setProcessingId(request.id);

        try {
            const { error } = await supabase
                .from("hospital_profiles")
                .update({
                    is_verified: false,
                    verification_status: "rejected",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", request.id);

            if (error) {
                console.error("Rejection error:", error);
                toast.error("Failed to reject hospital");
                setProcessingId(null);
                return;
            }

            toast.success(`${request.hospital_name} has been rejected`);
            await fetchVerificationRequests();
        } catch (error) {
            console.error("Rejection error:", error);
            toast.error("An error occurred during rejection");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string, isVerified: boolean) => {
        if (isVerified) {
            return (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                </Badge>
            );
        }

        if (status === "rejected") {
            return (
                <Badge className="bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                </Badge>
            );
        }

        return (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Clock className="w-3 h-3 mr-1" />
                Pending
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64 bg-[#222222]" />
                    <Skeleton className="h-96 w-full bg-[#222222]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shield className="w-8 h-8 text-[#00BFFF]" />
                            Hospital Verification
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Review and approve hospital registration requests
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/admin/dashboard")}
                        className="border-[#333333] hover:bg-[#1A1A1A]"
                    >
                        Back to Admin
                    </Button>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#111111] border-[#222222]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {requests.filter((r) => !r.is_verified && r.verification_status === "pending").length}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-400/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111111] border-[#222222]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Verified</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {requests.filter((r) => r.is_verified).length}
                                    </p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111111] border-[#222222]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Rejected</p>
                                    <p className="text-2xl font-bold text-[#FF5252]">
                                        {requests.filter((r) => r.verification_status === "rejected").length}
                                    </p>
                                </div>
                                <XCircle className="w-8 h-8 text-[#FF5252]/50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Verification Table */}
                <Card className="bg-[#111111] border-[#222222]">
                    <CardHeader>
                        <CardTitle>Verification Requests</CardTitle>
                        <CardDescription>
                            Review hospital credentials and approve or reject applications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No verification requests found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#222222] hover:bg-transparent">
                                        <TableHead className="text-gray-400">Hospital Name</TableHead>
                                        <TableHead className="text-gray-400">CAC Number</TableHead>
                                        <TableHead className="text-gray-400">MDCN License</TableHead>
                                        <TableHead className="text-gray-400">Certificate</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Submitted</TableHead>
                                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow
                                            key={request.id}
                                            className="border-[#222222] hover:bg-[#1A1A1A]"
                                        >
                                            <TableCell className="font-medium text-white">
                                                {request.hospital_name}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {request.registration_number}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {request.license_number}
                                            </TableCell>
                                            <TableCell>
                                                {request.license_path ? (
                                                    <a
                                                        href={request.license_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-[#00BFFF] hover:underline"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-600">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(request.verification_status, request.is_verified)}
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!request.is_verified && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(request)}
                                                                disabled={processingId === request.id}
                                                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleReject(request)}
                                                                disabled={processingId === request.id}
                                                                className="border-[#FF5252] text-[#FF5252] hover:bg-[#FF5252]/10"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {request.is_verified && (
                                                        <span className="text-sm text-gray-500">Verified</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
