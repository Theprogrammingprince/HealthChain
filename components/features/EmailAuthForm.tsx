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
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight, Stethoscope, ShieldCheck, Activity, RefreshCw, Eye, EyeOff, User } from "lucide-react";
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
    firstName: z.string().optional(),
    lastName: z.string().optional(),
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
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { setUserRole } = useAppStore();

    const form = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
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
                    userMetadata.first_name = data.firstName;
                    userMetadata.last_name = data.lastName;
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
                        fullName: `${data.firstName} ${data.lastName}`, // Default name
                        consent_at: new Date().toISOString(),
                        ...(role === "Hospital" && { hospitalName: "New Medical Facility" }),
                        ...(role === "Doctor" && {
                            medicalLicenseNumber: data.medicalLicense,
                            primaryHospitalId: data.hospitalAffiliation,
                            specialty: data.specialty,
                            firstName: data.firstName,
                            lastName: data.lastName
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {mode === "signup" && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control as any}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">First name*</FormLabel>
                                    <FormControl>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Input
                                                placeholder="Mike"
                                                className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                                                {...field}
                                            />
                                        </motion.div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control as any}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Last name*</FormLabel>
                                    <FormControl>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.05 }}
                                        >
                                            <Input
                                                placeholder="Jonath"
                                                className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                                                {...field}
                                            />
                                        </motion.div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                <FormField
                    control={form.control as any}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Email Address*</FormLabel>
                            <FormControl>
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: mode === "signup" ? 0.1 : 0 }}
                                >
                                    <Input
                                        placeholder="name@example.com"
                                        className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                                        {...field}
                                    />
                                </motion.div>
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
                            <FormLabel className="text-sm font-medium text-gray-700">Create Password*</FormLabel>
                            <FormControl>
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: mode === "signup" ? 0.15 : 0.05 }}
                                    className="relative"
                                >
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all pr-10"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </motion.div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {mode === "signup" && role === "Doctor" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <FormField
                            control={form.control as any}
                            name="hospitalAffiliation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Hospital Affiliation*</FormLabel>
                                    <FormControl>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.25 }}
                                        >
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all">
                                                    <SelectValue placeholder="Select Hospital" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-300 text-gray-700">
                                                    {hospitals.map((hospital) => (
                                                        <SelectItem key={hospital.id} value={hospital.id} className="focus:bg-gray-100 cursor-pointer">
                                                            {hospital.hospital_name}
                                                        </SelectItem>
                                                    ))}
                                                    {hospitals.length === 0 && (
                                                        <div className="p-2 text-xs text-gray-500 italic">No hospitals found</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </motion.div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control as any}
                            name="medicalLicense"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Medical License Number*</FormLabel>
                                    <FormControl>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                        >
                                            <Input
                                                placeholder="License ID (e.g. MED-123)"
                                                className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                                                {...field}
                                            />
                                        </motion.div>
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
                                    <FormLabel className="text-sm font-medium text-gray-700">Area of Specialty*</FormLabel>
                                    <FormControl>
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.35 }}
                                        >
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger className="h-11 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all">
                                                    <SelectValue placeholder="Select Specialty" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-300 text-gray-700">
                                                    {["General Practice", "Cardiology", "Neurology", "Pediatrics", "Oncology", "Surgery", "Radiology", "Dermatology", "Psychiatry", "Other"].map((spec) => (
                                                        <SelectItem key={spec} value={spec} className="focus:bg-gray-100 cursor-pointer">
                                                            {spec}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </motion.div>
                                    </FormControl>
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-0.5"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none flex-1">
                                    <FormLabel className="text-sm font-normal text-gray-600 leading-[1.6] cursor-pointer">
                                        I understand and agree to the{' '}
                                        <Link 
                                            href="/terms" 
                                            className="text-gray-900 font-medium underline hover:text-gray-700 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Terms & Conditions
                                        </Link>
                                        ,{' '}
                                        <Link 
                                            href="/user-agreement" 
                                            className="text-gray-900 font-medium underline hover:text-gray-700 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            User Agreement
                                        </Link>
                                        , and{' '}
                                        <Link 
                                            href="/privacy" 
                                            className="text-gray-900 font-medium underline hover:text-gray-700 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Privacy Policy
                                        </Link>
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                )}

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: mode === "signup" ? 0.2 : 0.1 }}
                >
                    <Button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-800 text-white h-12 rounded-lg transition-all font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            mode === "signup" ? "Create Account" : "Sign In"
                        )}
                    </Button>
                </motion.div>
            </form>
        </Form>
    );
}