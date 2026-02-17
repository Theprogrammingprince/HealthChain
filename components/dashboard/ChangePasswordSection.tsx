"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChangePasswordSectionProps {
    variant?: "light" | "dark";
}

export function ChangePasswordSection({ variant = "dark" }: ChangePasswordSectionProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isLight = variant === "light";

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                toast.error("Unable to verify your identity");
                return;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                toast.error("Current password is incorrect");
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            toast.success("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            const msg = (error as { message?: string }).message || "Failed to change password";
            toast.error("Error", { description: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={`${isLight ? "bg-white border-gray-200" : "bg-white/5 border-white/10"} overflow-hidden rounded-3xl`}>
            <CardHeader className={`border-b ${isLight ? "border-gray-100 bg-gray-50/50" : "border-white/5 bg-white/[0.02]"} p-8`}>
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${isLight ? "bg-blue-50 border-blue-100" : "bg-red-500/20 border-red-500/20"} rounded-2xl flex items-center justify-center border`}>
                        <Lock className={`w-7 h-7 ${isLight ? "text-blue-600" : "text-red-400"}`} />
                    </div>
                    <div>
                        <CardTitle className={`text-2xl font-black uppercase tracking-tight ${isLight ? "text-gray-900" : "text-white"}`}>
                            Change Password
                        </CardTitle>
                        <CardDescription className={`${isLight ? "text-gray-500" : "text-gray-500"} font-medium`}>
                            Update your account password
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? "text-gray-500" : "text-gray-500"}`}>
                            Current Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className={`h-12 pl-12 pr-10 ${isLight ? "bg-gray-50 border-gray-200 focus:border-blue-600" : "bg-white/5 border-white/10 focus:border-indigo-500"} rounded-xl transition-all`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className={`h-px ${isLight ? "bg-gray-100" : "bg-white/5"}`} />

                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? "text-gray-500" : "text-gray-500"}`}>
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className={`h-12 pl-12 pr-10 ${isLight ? "bg-gray-50 border-gray-200 focus:border-blue-600" : "bg-white/5 border-white/10 focus:border-indigo-500"} rounded-xl transition-all`}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? "text-gray-500" : "text-gray-500"}`}>
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className={`h-12 pl-12 pr-10 ${isLight ? "bg-gray-50 border-gray-200 focus:border-blue-600" : "bg-white/5 border-white/10 focus:border-indigo-500"} rounded-xl transition-all`}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {newPassword && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className={`text-xs font-medium ${isLight ? "text-gray-500" : "text-gray-500"}`}>Strength</p>
                                {newPassword === confirmPassword && confirmPassword.length > 0 && (
                                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Passwords match
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1.5 flex-1 rounded-full transition-colors ${newPassword.length >= level * 3
                                                ? newPassword.length >= 12
                                                    ? "bg-emerald-500"
                                                    : newPassword.length >= 9
                                                        ? "bg-blue-500"
                                                        : newPassword.length >= 6
                                                            ? "bg-amber-500"
                                                            : "bg-red-500"
                                                : isLight ? "bg-gray-200" : "bg-white/10"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`${isLight ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
