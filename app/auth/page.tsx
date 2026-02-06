"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLoginButton } from "@/components/features/GoogleLoginButton";
import { EmailAuthForm } from "@/components/features/EmailAuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { TestimonialSlider } from "@/components/features/TestimonialSlider";
import { RoleSwitcher } from "@/components/features/RoleSwitcher";


export default function AuthPage() {
    const router = useRouter();
    const [role, setRole] = useState<'Patient' | 'Hospital' | 'Doctor'>('Patient');
    const [mode, setMode] = useState<"login" | "signup">("signup");
    const { } = useAppStore();

    useEffect(() => {
        localStorage.setItem('healthchain_intended_role', role.toLowerCase());
    }, [role]);

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row relative overflow-x-hidden">
            <Link href="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group z-50">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
            </Link>

            {/* Left Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 pt-16 sm:p-6 sm:pt-20 lg:p-16 relative z-10 min-h-screen lg:min-h-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-black">HealthChain</span>
                    </div>

                    {/* Role Switcher */}
                    <RoleSwitcher role={role} onRoleChange={setRole} />

                    {/* Heading */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {mode === "signup" ? "Create Your Account" : "Welcome Back"}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            {mode === "signup" 
                                ? `Join HealthChain to ${role === 'Patient' ? 'manage your health records' : role === 'Doctor' ? 'provide better care' : 'streamline operations'} with ease.`
                                : "Sign in to access your account"}
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="mb-6">
                        <GoogleLoginButton role={role} />
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Email Auth Form */}
                    <EmailAuthForm mode={mode} role={role} />

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setMode(mode === "login" ? "signup" : "login")}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <span className="font-semibold underline">
                                {mode === "login" ? "Sign Up" : "Log In"}
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Testimonial Slider */}
            <div className="hidden lg:block lg:w-1/2 relative lg:min-h-screen">
                <TestimonialSlider role={role} />
            </div>
        </div>
    );
}
