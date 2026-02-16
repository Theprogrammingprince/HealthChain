"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2, CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsValidSession(true);
            }
            setIsChecking(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsValidSession(true);
                setIsChecking(false);
            }
        });

        checkSession();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success("Password updated successfully!");

            setTimeout(() => {
                router.push("/auth");
            }, 3000);
        } catch (error: unknown) {
            const msg = (error as { message?: string }).message || "Failed to update password";
            toast.error("Error", { description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 max-w-md"
                >
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                            <Shield className="w-10 h-10 text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Invalid or Expired Link</h2>
                    <p className="text-gray-500 text-sm">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link href="/forgot-password">
                        <Button className="bg-black hover:bg-gray-800 text-white h-12 px-8 rounded-lg">
                            Request New Link
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

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

                {isSuccess ? (
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
                            <h2 className="text-2xl font-bold text-gray-900">Password Updated</h2>
                            <p className="text-gray-500 text-sm">
                                Your password has been successfully reset. Redirecting you to sign in...
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
                            <p className="text-sm text-gray-500">
                                Choose a strong password for your HealthChain account.
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-10 pr-10 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 pl-10 pr-10 border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {password && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500">Password Strength</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${password.length >= level * 3
                                                        ? password.length >= 12
                                                            ? "bg-emerald-500"
                                                            : password.length >= 9
                                                                ? "bg-blue-500"
                                                                : password.length >= 6
                                                                    ? "bg-amber-500"
                                                                    : "bg-red-500"
                                                        : "bg-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {password.length < 6
                                            ? "Too short — minimum 6 characters"
                                            : password.length < 9
                                                ? "Fair — try adding more characters"
                                                : password.length < 12
                                                    ? "Good — strong password"
                                                    : "Excellent — very strong password"}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-black hover:bg-gray-800 text-white h-12 rounded-lg font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}
