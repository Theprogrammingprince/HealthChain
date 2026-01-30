"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight, Stethoscope, ShieldCheck, Activity, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { resolveRoute } from "@/lib/routing";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";

const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    consent: z.boolean(),
    hospitalAffiliation: z.string().optional(),
    medicalLicense: z.string().optional(),
    specialty: z.string().optional().default("General Practice"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface EmailAuthFormProps {
    mode: "login" | "signup";
    role?: "Patient" | "Hospital" | "Doctor";
    onSuccess?: () => void;
}

export function EmailAuthForm({ mode, role = "Patient", onSuccess }: EmailAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [hospitals, setHospitals] = useState<{ id: string, hospital_name: string }[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const router = useRouter();
    const { setUserRole } = useAppStore();

    const form = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
            consent: false,
            hospitalAffiliation: "",
            medicalLicense: "",
            specialty: "General Practice",
        },
    });

    useEffect(() => {
        if (mode === "signup" && role === "Doctor") {
            const fetchHospitals = async () => {
                try {
                    const res = await fetch('/api/hospitals');
                    const json = await res.json();
                    if (json.success) {
                        setHospitals(json.data || []);
                    } else {
                        console.error("Failed to fetch hospitals:", json.error);
                    }
                } catch (err) {
                    console.error("Failed to fetch hospitals:", err);
                }
            };
            fetchHospitals();
        }
    }, [mode, role]);

    // Cooldown timer effect
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Start cooldown when success screen is shown
    useEffect(() => {
        if (showSuccess) {
            setResendCooldown(60); // 60 seconds initial cooldown
        }
    }, [showSuccess]);

    const handleResendEmail = async () => {
        const email = form.getValues('email');
        if (!email) return;

        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) throw error;

            toast.success("Verification email sent!", {
                description: "Please check your inbox and spam folder."
            });
            setResendCooldown(60); // Reset cooldown after successful resend
        } catch (error: any) {
            console.error("Resend error:", error);
            toast.error("Failed to resend email", {
                description: error.message || "Please try again later."
            });
        } finally {
            setIsResending(false);
        }
    };

    const onSubmit = async (data: AuthFormData) => {
        if (mode === "signup" && !data.consent) {
            toast.error("You must agree to the privacy policy to continue.");
            return;
        }

        if (mode === "signup" && role === "Doctor") {
            if (!data.hospitalAffiliation || !data.medicalLicense) {
                toast.error("Professional credentials are required.");
                return;
            }
        }
        setIsLoading(true);
        try {
            if (mode === "signup") {
                // Store all role-specific data in user_metadata so it's available in callback
                const userMetadata: Record<string, unknown> = {
                    role: role.toLowerCase(),
                    consent_at: new Date().toISOString(),
                };

                // Add doctor-specific metadata
                if (role === "Doctor") {
                    userMetadata.first_name = data.email.split('@')[0];
                    userMetadata.last_name = "MD";
                    userMetadata.medical_license = data.medicalLicense;
                    userMetadata.specialty = data.specialty || "General Practice";
                    userMetadata.hospital_id = data.hospitalAffiliation;
                }

                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: userMetadata,
                    },
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Call registration API to create profile
                    const session = authData.session;
                    const registrationData = {
                        userId: authData.user.id,
                        email: data.email,
                        role: role.toLowerCase(),
                        authProvider: "email",
                        fullName: data.email.split('@')[0], // Default name
                        consent_at: new Date().toISOString(),
                        ...(role === "Hospital" && { hospitalName: "New Medical Facility" }),
                        ...(role === "Doctor" && {
                            medicalLicenseNumber: data.medicalLicense,
                            primaryHospitalId: data.hospitalAffiliation,
                            specialty: data.specialty,
                            firstName: data.email.split('@')[0],
                            lastName: "MD"
                        })
                    };

                    const response = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(session?.access_token && { "Authorization": `Bearer ${session.access_token}` })
                        },
                        body: JSON.stringify(registrationData),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        const errorMsg = errorData.message || errorData.error || 'Failed to create system profile';
                        if (errorData.details) console.error("Reg details:", errorData.details);
                        throw new Error(errorMsg);
                    }

                    // Update store
                    setUserRole(role);
                    console.log("Signup complete. Role set in store:", role);

                    // Redirect if we have a session (auto-confirm enabled)
                    console.log("AuthData session status:", !!authData.session);
                    if (authData.session) {
                        const targetPath = resolveRoute(role.toLowerCase(), 'pending');
                        console.log("Attempting redirect to:", targetPath);
                        router.push(targetPath);
                    } else {
                        console.log("No session found after signup. Showing success screen.");
                        setShowSuccess(true);
                    }

                    if (role === 'Doctor') {
                        setShowSuccess(true);
                        return;
                    }

                    onSuccess?.();
                }
            } else {
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });

                if (authError) throw authError;

                if (authData.user) {
                    toast.success("Welcome back!");

                    // Fetch profile to get role
                    const { data: profile } = await supabase
                        .from("users")
                        .select("role")
                        .eq("id", authData.user.id)
                        .single();

                    const userRole = profile?.role || "patient";
                    setUserRole(userRole === "hospital" ? "Hospital" : userRole === "admin" ? "Admin" : "Patient");

                    // Use centralized routing logic
                    const targetPath = resolveRoute(userRole);
                    router.push(targetPath);

                    onSuccess?.();
                }
            }
        } catch (error: unknown) {
            console.error("Auth error:", error);
            toast.error(mode === "signup" ? "Signup Failed" : "Login Failed", {
                description: error.message || (error as any).details,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/20">
                        <Mail className="w-10 h-10 text-indigo-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Check your email</h3>
                    <p className="text-gray-500 text-sm font-medium">
                        We&apos;ve sent a verification link to <span className="text-white">{form.getValues('email')}</span>.
                    </p>
                </div>
                {role === 'Doctor' ? (
                    <>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Application Received</h3>
                        <p className="text-gray-500 text-sm font-medium">
                            Your professional application is <span className="text-emerald-400">Under Review</span>.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Check your email</h3>
                        <p className="text-gray-500 text-sm font-medium">
                            We've sent a verification link to <span className="text-white">{form.getValues('email')}</span>.
                        </p>
                    </>
                )}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {role === 'Doctor' ? 'Credential Verification in Progress' : 'Protocol Step: Verify Identity'}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-8">
                        Once you click the link in your email, you&apos;ll be automatically routed to the {role} {role === 'Hospital' ? 'Verification' : 'Dashboard'}.
                        {role === 'Doctor'
                            ? "Your medical license and hospital affiliation are being verified by the hospital administration. You will receive access once approved."
                            : `Once you click the link in your email, you'll be automatically routed to the ${role} ${role === 'Hospital' ? 'Verification' : 'Dashboard'}.`
                        }
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/')}
                    variant="ghost"
                    className="text-gray-500 hover:text-white group"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest mr-2">Return to Hub</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Resend Email Button */}
                <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 mb-3 uppercase tracking-widest font-bold">
                        Didn't receive the email?
                    </p>
                    <Button
                        onClick={handleResendEmail}
                        variant="outline"
                        disabled={resendCooldown > 0 || isResending}
                        className="w-full border-white/10 hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-50"
                    >
                        {isResending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                        ) : resendCooldown > 0 ? (
                            <><RefreshCw className="w-4 h-4 mr-2" /> Resend in {resendCooldown}s</>
                        ) : (
                            <><RefreshCw className="w-4 h-4 mr-2" /> Resend Verification Email</>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control as any}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-400">Email</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="name@example.com"
                                        className="bg-white/5 border-white/10 pl-10 focus:border-indigo-500"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control as any}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-400">Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 pl-10 focus:border-indigo-500"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {mode === "signup" && role === "Doctor" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4 pt-2"
                    >
                        <FormField
                            control={form.control as any}
                            name="hospitalAffiliation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Hospital Affiliation</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <div className="relative">
                                                <Stethoscope className="absolute left-3 top-3 h-4 w-4 z-10 text-gray-500" />
                                                <SelectTrigger className="bg-white/5 border-white/10 pl-10 focus:border-indigo-500 h-10 w-full">
                                                    <SelectValue placeholder="Select Hospital" />
                                                </SelectTrigger>
                                            </div>
                                        </FormControl>
                                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                                            {hospitals.map((hospital) => (
                                                <SelectItem key={hospital.id} value={hospital.id} className="focus:bg-white/5 cursor-pointer">
                                                    {hospital.hospital_name}
                                                </SelectItem>
                                            ))}
                                            {hospitals.length === 0 && (
                                                <div className="p-2 text-xs text-gray-500 italic">No hospitals found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control as any}
                            name="medicalLicense"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Medical License Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="License ID (e.g. MED-123)"
                                                className="bg-white/5 border-white/10 pl-10 focus:border-indigo-500"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control as any}
                            name="specialty"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Area of Specialty</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <div className="relative">
                                                <Activity className="absolute left-3 top-3 h-4 w-4 z-10 text-gray-500" />
                                                <SelectTrigger className="bg-white/5 border-white/10 pl-10 focus:border-indigo-500 h-10 w-full">
                                                    <SelectValue placeholder="Select Specialty" />
                                                </SelectTrigger>
                                            </div>
                                        </FormControl>
                                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                                            {["General Practice", "Cardiology", "Neurology", "Pediatrics", "Oncology", "Surgery", "Radiology", "Dermatology", "Psychiatry", "Other"].map((spec) => (
                                                <SelectItem key={spec} value={spec} className="focus:bg-white/5 cursor-pointer">
                                                    {spec}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>
                )}

                {mode === "signup" && (
                    <FormField
                        control={form.control as any}
                        name="consent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/5 bg-white/5 p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-[11px] font-medium text-gray-400 leading-relaxed">
                                        I agree to HealthChain&apos;s <span className="text-indigo-400 cursor-pointer">Privacy Policy</span> and <span className="text-indigo-400 cursor-pointer">Data Usage Terms</span>, including the storage of my encrypted health records on decentralized channels.
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                )}

                <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl transition-all"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        mode === "signup" ? "Create Account" : "Sign In"
                    )}
                </Button>

                <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">
                    Need assistance? <Link href="/support" className="text-indigo-400 hover:text-indigo-300">Contact Protocol Support</Link>
                </p>
            </form>
        </Form>
    );
}