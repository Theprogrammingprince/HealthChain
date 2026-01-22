"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, Building2, Loader2, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface RoleSelectionModalProps {
    open: boolean;
    onClose?: () => void;
}

export function RoleSelectionModal({ open, onClose }: RoleSelectionModalProps) {
    const router = useRouter();
    const { supabaseSession, setUserRole } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"Patient" | "Hospital" | null>(null);
    const [hasConsented, setHasConsented] = useState(false);

    const handleRoleSelection = async (role: "Patient" | "Hospital") => {
        if (!hasConsented) {
            toast.error("Please agree to the Privacy Policy to continue.");
            return;
        }
        if (!supabaseSession?.user) {
            toast.error("No active session. Please sign in again.");
            return;
        }

        setIsSubmitting(true);
        setSelectedRole(role);

        try {
            // Update user role in Supabase
            const { error } = await supabase
                .from("users")
                .update({ role: role.toLowerCase() })
                .eq("id", supabaseSession.user.id);

            if (error) {
                console.error("Error updating role:", error);
                toast.error("Failed to set role. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Update local state
            setUserRole(role);

            // Route based on role
            if (role === "Patient") {
                toast.success("Welcome! Setting up your medical vault...");
                router.push("/patient/dashboard");
            } else {
                toast.success("Redirecting to verification...");
                router.push("/clinical/verify");
            }

            onClose?.();
        } catch (error) {
            console.error("Role selection error:", error);
            toast.error("An error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-[#222222] [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-white">
                        Select Your Role
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Choose how you'll use HealthChain
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-6">
                    {/* Patient Option */}
                    <motion.button
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        onClick={() => handleRoleSelection("Patient")}
                        disabled={isSubmitting}
                        className={`
                            relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all w-full
                            ${isSubmitting && selectedRole === "Patient"
                                ? "border-[#00BFFF] bg-[#00BFFF]/10"
                                : "border-[#333333] bg-[#111111] hover:border-[#00BFFF] hover:bg-[#00BFFF]/5"
                            }
                            ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#00BFFF]/20 p-3 border border-[#00BFFF]/30">
                                <User className="h-6 w-6 text-[#00BFFF]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">
                                    Individual / Patient
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Manage your personal medical records and health data
                                </p>
                            </div>
                            {isSubmitting && selectedRole === "Patient" && (
                                <Loader2 className="h-5 w-5 animate-spin text-[#00BFFF]" />
                            )}
                        </div>
                    </motion.button>

                    {/* Hospital Option */}
                    <motion.button
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        onClick={() => handleRoleSelection("Hospital")}
                        disabled={isSubmitting}
                        className={`
                            relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all w-full
                            ${isSubmitting && selectedRole === "Hospital"
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-[#333333] bg-[#111111] hover:border-indigo-500 hover:bg-indigo-500/5"
                            }
                            ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-indigo-500/20 p-3 border border-indigo-500/30">
                                <Building2 className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">
                                    Hospital / Clinic
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Access patient records with proper authorization
                                </p>
                            </div>
                            {isSubmitting && selectedRole === "Hospital" && (
                                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                            )}
                        </div>
                    </motion.button>

                    {/* Consent Checkbox */}
                    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/5 bg-white/5 p-4 mt-6">
                        <Checkbox
                            id="audit-consent"
                            checked={hasConsented}
                            onCheckedChange={(checked: boolean) => setHasConsented(checked === true)}
                            disabled={isSubmitting}
                        />
                        <div className="space-y-1 leading-none">
                            <label
                                htmlFor="audit-consent"
                                className="text-[11px] font-medium text-gray-400 leading-relaxed cursor-pointer"
                            >
                                I agree to HealthChain's <span className="text-indigo-400 underline">Privacy Policy</span> and <span className="text-indigo-400 underline">Data Usage Terms</span>, confirming my consent for secure health record storage.
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-2 p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg">
                    <p className="text-xs text-gray-500 text-center">
                        Your role determines dashboard access and permissions. This cannot be changed later.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
