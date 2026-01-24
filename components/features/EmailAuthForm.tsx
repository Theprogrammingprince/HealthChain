"use client";

import { useState } from "react";
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
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight, Stethoscope, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { resolveRoute } from "@/lib/routing";

import { Checkbox } from "@/components/ui/checkbox";

const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    consent: z.boolean(),
    hospitalAffiliation: z.string().optional(),
    medicalLicense: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

interface EmailAuthFormProps {
    mode: "login" | "signup";
    role?: "Patient" | "Hospital" | "Doctor";
    onSuccess?: () => void;
}

export function EmailAuthForm({ mode, role = "Patient", onSuccess }: EmailAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
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
        },
    });

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
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            role: role.toLowerCase(),
                            consent_at: new Date().toISOString(),
                        },
                    },
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Call registration API to create profile
                    const registrationData = {
                        userId: authData.user.id,
                        email: data.email,
                        role: role.toLowerCase(),
                        authProvider: "email",
                        fullName: data.email.split('@')[0], // Default name
                        consent_at: new Date().toISOString(),
                        ...(role === "Hospital" && { hospitalName: "New Medical Facility" })
                    };

                    await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(registrationData),
                    });

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
                description: error.message,
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
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
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
                    control={form.control}
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
                            control={form.control}
                            name="hospitalAffiliation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Hospital Affiliation</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Enter Hospital Name"
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
                            control={form.control}
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
                    </motion.div>
                )}

                {mode === "signup" && (
                    <FormField
                        control={form.control}
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
            </form>
        </Form>
    );
}