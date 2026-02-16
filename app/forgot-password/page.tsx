"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setEmailSent(true);
            toast.success("Reset link sent!", {
                description: "Check your email for the password reset link.",
            });
        } catch (error: unknown) {
            const msg = (error as { message?: string }).message || "Failed to send reset email";
            toast.error("Error", { description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <Link
                href="/auth"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group z-50"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Login</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-black">HealthChain</span>
                </div>

                {emailSent ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                            <p className="text-gray-500 text-sm">
                                We&apos;ve sent a password reset link to{" "}
                                <span className="font-semibold text-gray-900">{email}</span>
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-gray-500">
                                    The link will expire in 1 hour. If you don&apos;t see the email, check your spam folder.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => setEmailSent(false)}
                                variant="outline"
                                className="w-full h-12 rounded-lg border-gray-300"
                            >
                                Try a different email
                            </Button>
                            <Link href="/auth">
                                <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
                                    Back to Sign In
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
                            <p className="text-sm text-gray-500">
                                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-10 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-black hover:bg-gray-800 text-white h-12 rounded-lg font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/auth" className="text-sm text-gray-500 hover:text-gray-900">
                                Remember your password?{" "}
                                <span className="font-semibold underline">Sign In</span>
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
