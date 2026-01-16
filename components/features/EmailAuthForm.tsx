"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface EmailAuthFormProps {
    mode: "login" | "signup";
    role?: "Patient" | "Hospital" | "Admin";
    onSuccess?: () => void;
}

export function EmailAuthForm({ mode, role = "Patient", onSuccess }: EmailAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUserRole } = useAppStore();

    const form = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: AuthFormData) => {
        setIsLoading(true);
        try {
            if (mode === "signup") {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            role: role.toLowerCase(),
                        },
                    },
                });

                if (authError) throw authError;

                if (authData.user) {
                    toast.success("Account created!", {
                        description: "Please check your email to verify your account.",
                    });

                    // Call registration API to create profile
                    const registrationData = {
                        userId: authData.user.id,
                        email: data.email,
                        role: role.toLowerCase(),
                        authProvider: "email",
                        fullName: data.email.split('@')[0], // Default name
                        ...(role === "Hospital" && { hospitalName: "New Medical Facility" })
                    };

                    await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(registrationData),
                    });

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

                    // Redirect based on role
                    if (userRole === "admin") {
                        router.push("/admin");
                    } else if (userRole === "hospital") {
                        router.push("/clinical");
                    } else {
                        router.push("/dashboard");
                    }

                    onSuccess?.();
                }
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            toast.error(mode === "signup" ? "Signup Failed" : "Login Failed", {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

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
