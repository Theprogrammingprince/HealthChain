"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HospitalDashboardGuardProps {
    children: ReactNode;
    allowedForUnverified?: boolean; // If true, this page is accessible even when unverified
}

interface HospitalProfile {
    verification_status: "pending" | "verified" | "rejected";
    rejection_reason?: string | null;
    hospital_name?: string;
}

export function HospitalDashboardGuard({
    children,
    allowedForUnverified = false
}: HospitalDashboardGuardProps) {
    const router = useRouter();
    const { supabaseSession, walletAddress } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile | null>(null);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        checkVerificationStatus();
    }, [supabaseSession, walletAddress]);

    const checkVerificationStatus = async () => {
        try {
            setIsLoading(true);

            const userId = supabaseSession?.user?.id || walletAddress;

            if (!userId) {
                router.push("/signin");
                return;
            }

            // Check user role
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("id", userId)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                console.error("Error fetching user:", userError);
                toast.error("Failed to verify user role");
                router.push("/dashboard");
                return;
            }

            // If user doesn't exist or is not a hospital, redirect
            if (!userData || userData.role !== "hospital") {
                toast.error("Access denied. Hospital role required.");
                router.push("/dashboard");
                return;
            }

            // Check hospital profile and verification status
            const { data: hospitalData, error: hospitalError } = await supabase
                .from("hospital_profiles")
                .select("verification_status, rejection_reason, hospital_name")
                .eq("user_id", userId)
                .single();

            if (hospitalError && hospitalError.code !== 'PGRST116') {
                console.error("Error fetching hospital profile:", hospitalError);
            }

            if (hospitalData) {
                setHospitalProfile(hospitalData);

                // If not verified and trying to access restricted content
                if (hospitalData.verification_status !== "verified" && !allowedForUnverified) {
                    setIsBlocked(true);
                } else {
                    setIsBlocked(false);
                }
            } else {
                // No hospital profile exists - redirect to verification page
                toast.info("Please complete your hospital verification");
                router.push("/clinical/verify");
                return;
            }
        } catch (error) {
            console.error("Error in verification check:", error);
            toast.error("An error occurred while checking verification status");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
                <div className="w-full max-w-2xl space-y-4">
                    <Skeleton className="h-12 w-full bg-[#222222]" />
                    <Skeleton className="h-64 w-full bg-[#222222]" />
                    <Skeleton className="h-12 w-full bg-[#222222]" />
                </div>
            </div>
        );
    }

    // Blocked state - show access denied for unverified hospitals
    if (isBlocked && hospitalProfile) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-yellow-500/30">
                            <Lock className="w-10 h-10 text-yellow-400" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">
                                Access Restricted
                            </h2>
                            <p className="text-gray-400">
                                Your hospital account is currently{" "}
                                <span className="font-semibold text-yellow-400">
                                    {hospitalProfile.verification_status === "pending"
                                        ? "pending verification"
                                        : "not verified"}
                                </span>
                            </p>
                        </div>

                        {hospitalProfile.verification_status === "pending" && (
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                                <p className="text-sm text-yellow-200/80">
                                    Our admin team is reviewing your application. This typically takes 24-48 hours.
                                    You'll receive an email notification once your account is verified.
                                </p>
                            </div>
                        )}

                        {hospitalProfile.verification_status === "rejected" && (
                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-2">
                                <p className="text-sm text-red-200/80">
                                    Your verification was rejected. Please review the reason below and resubmit your application.
                                </p>
                                {hospitalProfile.rejection_reason && (
                                    <p className="text-xs text-red-300 font-medium">
                                        Reason: {hospitalProfile.rejection_reason}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="pt-4 space-y-3">
                            <p className="text-sm text-gray-500">
                                While waiting for verification, you can:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() => router.push("/clinical/settings")}
                                    className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold"
                                >
                                    <SettingsIcon className="w-4 h-4 mr-2" />
                                    Manage Settings
                                </Button>
                                {hospitalProfile.verification_status === "rejected" && (
                                    <Button
                                        onClick={() => router.push("/clinical/verify")}
                                        variant="outline"
                                        className="border-[#333333] hover:bg-white/5"
                                    >
                                        Resubmit Verification
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Verified or allowed for unverified - render children
    return <>{children}</>;
}
