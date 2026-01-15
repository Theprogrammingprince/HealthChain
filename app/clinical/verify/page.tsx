"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    Upload,
    FileText,
    CheckCircle2,
    Clock,
    Shield,
    AlertCircle,
    Building2,
} from "lucide-react";

// Zod validation schema
const hospitalVerificationSchema = z.object({
    hospitalName: z.string().min(3, "Hospital name must be at least 3 characters"),
    cacNumber: z.string().min(5, "CAC number must be at least 5 characters"),
    mdcnLicense: z.string().min(5, "MDCN license must be at least 5 characters"),
    certificate: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
        .refine(
            (file) =>
                ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
                    file.type
                ),
            "Only PDF, JPG, and PNG files are allowed"
        )
        .optional(),
});

type HospitalVerificationFormData = z.infer<typeof hospitalVerificationSchema>;

export default function HospitalVerifyPage() {
    const router = useRouter();
    const { supabaseSession, walletAddress } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<
        "pending" | "verified" | "rejected" | null
    >(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const form = useForm<HospitalVerificationFormData>({
        resolver: zodResolver(hospitalVerificationSchema),
        defaultValues: {
            hospitalName: "",
            cacNumber: "",
            mdcnLicense: "",
        },
    });

    // Check verification status on mount
    useEffect(() => {
        checkVerificationStatus();
    }, [supabaseSession]);

    const checkVerificationStatus = async () => {
        try {
            setIsLoading(true);

            // Support both wallet users and Google OAuth users
            const userId = supabaseSession?.user?.id || walletAddress;

            if (!userId) {
                // No session and no wallet - redirect to signin
                router.push("/signin");
                return;
            }

            // Check user role
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("id", userId)
                .single();

            // If user doesn't exist in DB yet (new signup), allow them to stay and complete verification
            if (userError && userError.code === 'PGRST116') {
                // New user - no profile yet, show the form
                setIsLoading(false);
                return;
            }

            if (userError || (userData?.role && userData?.role !== "hospital")) {
                // Only redirect if user exists with wrong role
                if (userData?.role) {
                    toast.error("Access denied. Hospital role required.");
                    router.push("/dashboard");
                    return;
                }
            }

            // Check hospital profile
            const { data: hospitalData, error: hospitalError } = await supabase
                .from("hospital_profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (hospitalData) {
                setVerificationStatus(hospitalData.verification_status);

                // If already verified, redirect to clinical dashboard
                if (hospitalData.verification_status === "verified") {
                    toast.success("You are already verified!");
                    router.push("/clinical");
                    return;
                }

                // If pending, pre-fill form and mark as submitted
                if (hospitalData.verification_status === "pending") {
                    form.setValue("hospitalName", hospitalData.hospital_name || "");
                    form.setValue("cacNumber", hospitalData.registration_number || "");
                    form.setValue("mdcnLicense", hospitalData.license_number || "");
                    setHasSubmitted(true);
                }

                // If rejected, pre-fill form but allow resubmission
                if (hospitalData.verification_status === "rejected") {
                    form.setValue("hospitalName", hospitalData.hospital_name || "");
                    form.setValue("cacNumber", hospitalData.registration_number || "");
                    form.setValue("mdcnLicense", hospitalData.license_number || "");
                    setHasSubmitted(false); // Allow resubmission
                }
            }
            // If no hospital profile exists, that's fine - user can fill out the form
        } catch (error) {
            console.error("Error checking verification status:", error);
            // Don't block the user - let them fill out the form
        } finally {
            setIsLoading(false);
        }
    };

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
        },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
        disabled: hasSubmitted,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setUploadedFile(acceptedFiles[0]);
                form.setValue("certificate", acceptedFiles[0]);
                toast.success(`File "${acceptedFiles[0].name}" selected`);
            }
        },
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0];
            if (error?.code === "file-too-large") {
                toast.error("File is too large. Maximum size is 5MB.");
            } else if (error?.code === "file-invalid-type") {
                toast.error("Invalid file type. Only PDF, JPG, and PNG are allowed.");
            } else {
                toast.error("File upload failed. Please try again.");
            }
        },
    });

    // Upload certificate to Supabase Storage
    const uploadCertificate = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${walletAddress || supabaseSession?.user.id}/certificate.${fileExt}`;
            const filePath = fileName;

            setUploadProgress(10);

            const { data, error } = await supabase.storage
                .from("hospital-certificates")
                .upload(filePath, file, {
                    upsert: true,
                    cacheControl: "3600",
                });

            if (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload certificate");
                return null;
            }

            setUploadProgress(100);

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("hospital-certificates").getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error("Upload exception:", error);
            toast.error("An error occurred during upload");
            return null;
        }
    };

    // Form submission handler
    const onSubmit = async (data: HospitalVerificationFormData) => {
        // Support both wallet users and Google OAuth users
        const userId = supabaseSession?.user?.id || walletAddress;

        if (!userId) {
            toast.error("You must be logged in to submit");
            return;
        }

        if (!uploadedFile) {
            toast.error("Please upload a certificate");
            return;
        }

        try {
            setIsSubmitting(true);
            setUploadProgress(0);

            // STEP 1: Ensure user exists in the users table first
            // This handles the case where wallet registration may have failed earlier
            const { data: existingUser, error: userCheckError } = await supabase
                .from("users")
                .select("id")
                .eq("id", userId)
                .single();

            if (userCheckError && userCheckError.code === 'PGRST116') {
                // User doesn't exist - create them first
                console.log("Creating user record for:", userId);
                const { error: createUserError } = await supabase
                    .from("users")
                    .insert({
                        id: userId,
                        wallet_address: walletAddress || null,
                        email: supabaseSession?.user?.email || null,
                        role: "hospital",
                        auth_provider: walletAddress ? "wallet" : "google",
                        full_name: supabaseSession?.user?.user_metadata?.full_name || data.hospitalName,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (createUserError) {
                    console.error("Failed to create user:", createUserError);
                    toast.error("Failed to create user profile. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
                console.log("User created successfully");
            }

            // STEP 2: Upload certificate
            const certificateUrl = await uploadCertificate(uploadedFile);

            if (!certificateUrl) {
                setIsSubmitting(false);
                return;
            }

            // STEP 3: Insert/update hospital profile
            const { error: upsertError } = await supabase
                .from("hospital_profiles")
                .upsert(
                    {
                        user_id: userId,
                        hospital_name: data.hospitalName,
                        registration_number: data.cacNumber,
                        license_number: data.mdcnLicense,
                        license_path: certificateUrl,
                        verification_status: "pending",
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "user_id",
                    }
                );

            if (upsertError) {
                console.error("Upsert error:", upsertError);
                toast.error("Failed to submit verification request");
                setIsSubmitting(false);
                return;
            }

            // Success - show pending review message
            toast.success("Verification request submitted!", {
                description: "Your application is under review. You'll be notified within 24-48 hours."
            });
            setHasSubmitted(true);
            setVerificationStatus("pending");
            setUploadProgress(0);
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
                <Card className="w-full max-w-2xl bg-[#111111] border-[#222222]">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 bg-[#222222]" />
                        <Skeleton className="h-4 w-1/2 bg-[#222222] mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full bg-[#222222]" />
                        <Skeleton className="h-12 w-full bg-[#222222]" />
                        <Skeleton className="h-12 w-full bg-[#222222]" />
                        <Skeleton className="h-32 w-full bg-[#222222]" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                {/* Pending Status Banner */}
                <AnimatePresence>
                    {verificationStatus === "pending" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-5 flex items-start gap-4"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex-shrink-0 mt-0.5"
                            >
                                <Clock className="w-7 h-7 text-yellow-400" />
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-lg text-yellow-100">
                                    Awaiting Review
                                </h3>
                                <p className="text-sm text-yellow-200/80 mt-1">
                                    Your verification request has been submitted successfully. Our super admin team will review your application within <strong>24-48 hours</strong>.
                                </p>
                                <p className="text-xs text-yellow-300/60 mt-2">
                                    You'll receive a notification once your status is updated.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Rejected Status Banner */}
                    {verificationStatus === "rejected" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-gradient-to-r from-[#FF5252]/20 to-red-600/20 border border-[#FF5252]/30 rounded-lg p-4 flex items-center gap-3"
                        >
                            <AlertCircle className="w-6 h-6 text-[#FF5252]" />
                            <div>
                                <h3 className="font-semibold text-red-100">
                                    Verification Rejected
                                </h3>
                                <p className="text-sm text-red-200/80">
                                    Your application was not approved. Please review your information and resubmit.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Card className="bg-[#111111] border-[#222222] shadow-2xl">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 bg-[#00BFFF]/20 border-2 border-[#00BFFF]">
                                <AvatarFallback className="bg-transparent">
                                    <Building2 className="w-6 h-6 text-[#00BFFF]" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl font-bold text-white">
                                    Hospital Verification Required
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Upload your CAC/MDCN certificate to join the HealthChain network
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Hospital Name */}
                                <FormField
                                    control={form.control}
                                    name="hospitalName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Hospital Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={hasSubmitted}
                                                    placeholder="e.g., Lagos General Hospital"
                                                    className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF] transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#FF5252]" />
                                        </FormItem>
                                    )}
                                />

                                {/* CAC Number */}
                                <FormField
                                    control={form.control}
                                    name="cacNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">CAC Number *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={hasSubmitted}
                                                    placeholder="e.g., RC-123456"
                                                    className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF] transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#FF5252]" />
                                        </FormItem>
                                    )}
                                />

                                {/* MDCN License */}
                                <FormField
                                    control={form.control}
                                    name="mdcnLicense"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">
                                                MDCN License Number *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={hasSubmitted}
                                                    placeholder="e.g., MDCN-98765"
                                                    className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF] transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#FF5252]" />
                                        </FormItem>
                                    )}
                                />

                                {/* Certificate Upload */}
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Upload Certificate *</Label>
                                    <motion.div
                                        {...(() => {
                                            const { onDragStart, onDragEnd, onDragOver, onDrop, onDrag, onAnimationStart, ...rest } = getRootProps();
                                            return rest;
                                        })()}
                                        whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                                        className={`
                      relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                      ${isDragActive
                                                ? "border-[#00BFFF] bg-[#00BFFF]/10"
                                                : "border-[#333333] bg-[#1A1A1A]"
                                            }
                      ${hasSubmitted ? "opacity-50 cursor-not-allowed" : "hover:border-[#00BFFF] hover:bg-[#00BFFF]/5"}
                    `}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center gap-3">
                                            {uploadedFile ? (
                                                <>
                                                    <FileText className="w-12 h-12 text-[#00BFFF]" />
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {uploadedFile.name}
                                                        </p>
                                                        <p className="text-sm text-gray-400">
                                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    {!hasSubmitted && (
                                                        <p className="text-xs text-gray-500">
                                                            Click or drag to replace
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-12 h-12 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {isDragActive
                                                                ? "Drop your certificate here"
                                                                : "Drag & drop your certificate"}
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            or click to browse
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PDF, JPG, PNG • Max 5MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Upload Progress */}
                                <AnimatePresence>
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Uploading...</span>
                                                <span className="text-[#00BFFF]">{uploadProgress}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-2" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <motion.div whileHover={{ scale: hasSubmitted ? 1 : 1.02 }} whileTap={{ scale: hasSubmitted ? 1 : 0.98 }}>
                                    <Button
                                        type="submit"
                                        disabled={hasSubmitted || isSubmitting}
                                        className={`
                      w-full h-12 font-semibold text-base transition-all
                      ${hasSubmitted
                                                ? "bg-gray-700 cursor-not-allowed"
                                                : "bg-gradient-to-r from-[#00BFFF] to-[#0080FF] hover:shadow-lg hover:shadow-[#00BFFF]/50"
                                            }
                    `}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                >
                                                    <Shield className="w-5 h-5" />
                                                </motion.div>
                                                <span>Submitting...</span>
                                            </div>
                                        ) : hasSubmitted ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Submitted</span>
                                            </div>
                                        ) : (
                                            "Submit for Verification"
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>

                        {/* Privacy Notice */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg flex items-start gap-3"
                        >
                            <Shield className="w-5 h-5 text-[#00BFFF] flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-400">
                                <p className="font-medium text-gray-300 mb-1">Privacy & Security</p>
                                <p>
                                    All uploaded documents are encrypted and used only for verification.
                                    Patient data remains fully private and secured on the blockchain.
                                </p>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
