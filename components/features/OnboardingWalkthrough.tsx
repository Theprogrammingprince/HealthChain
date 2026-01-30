"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronRight,
    ChevronLeft,
    FileText,
    Shield,
    QrCode,
    Bell,
    Health,
    Stethoscope,
    Building2,
    Users,
    ClipboardCheck,
    HeartPulse,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

interface WalkthroughStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    tip?: string;
}

const patientSteps: WalkthroughStep[] = [
    {
        icon: <HeartPulse className="w-8 h-8 text-cyan-400" />,
        title: "Welcome to HealthChain",
        description: "Your medical records are now secure, portable, and under your control. Let's show you around.",
        tip: "Your data is encrypted and blockchain-verified"
    },
    {
        icon: <FileText className="w-8 h-8 text-emerald-400" />,
        title: "Your Medical Records",
        description: "View all your approved medical records in one place. Each record is verified by your healthcare provider.",
        tip: "Records require hospital and your approval before appearing here"
    },
    {
        icon: <ClipboardCheck className="w-8 h-8 text-amber-400" />,
        title: "Pending Approvals",
        description: "When a doctor submits a new record, you'll need to approve it. You can also reject with a reason.",
        tip: "Check the 'Pending' tab to see records waiting for your review"
    },
    {
        icon: <QrCode className="w-8 h-8 text-red-400" />,
        title: "Emergency Access",
        description: "Generate a QR code for emergency responders. They can access your critical info like blood type and allergies.",
        tip: "Keep your emergency card on your phone"
    },
    {
        icon: <Shield className="w-8 h-8 text-indigo-400" />,
        title: "Access Control",
        description: "You decide who sees your records. Grant or revoke access to hospitals and doctors anytime.",
        tip: "Check the Audit Log to see who accessed your data"
    }
];

const doctorSteps: WalkthroughStep[] = [
    {
        icon: <Stethoscope className="w-8 h-8 text-cyan-400" />,
        title: "Welcome, Doctor",
        description: "HealthChain helps you manage patient records securely with blockchain verification.",
        tip: "All submissions are logged for compliance"
    },
    {
        icon: <FileText className="w-8 h-8 text-emerald-400" />,
        title: "Submit Records",
        description: "Create and submit medical records for your patients. Records go through a two-step approval process.",
        tip: "Hospital approves first, then the patient"
    },
    {
        icon: <ClipboardCheck className="w-8 h-8 text-amber-400" />,
        title: "Track Submissions",
        description: "Monitor the status of your submissions. See approvals, rejections, and feedback in real-time.",
        tip: "Rejected records show the reason for rejection"
    },
    {
        icon: <Users className="w-8 h-8 text-blue-400" />,
        title: "Patient Search",
        description: "Search for patients by ID or name. Emergency access is available for critical situations.",
        tip: "Emergency access is logged and time-limited"
    }
];

const hospitalSteps: WalkthroughStep[] = [
    {
        icon: <Building2 className="w-8 h-8 text-cyan-400" />,
        title: "Welcome to HealthChain",
        description: "Manage your hospital's medical records and staff with complete transparency.",
        tip: "Your hospital verification is required to submit records"
    },
    {
        icon: <ClipboardCheck className="w-8 h-8 text-emerald-400" />,
        title: "Review Submissions",
        description: "Doctor submissions require your approval before going to patients. Review for accuracy and compliance.",
        tip: "Provide clear rejection reasons when needed"
    },
    {
        icon: <Users className="w-8 h-8 text-blue-400" />,
        title: "Staff Management",
        description: "Add and manage your medical staff. Control who can create and submit records.",
        tip: "Staff permissions can be revoked instantly"
    },
    {
        icon: <Shield className="w-8 h-8 text-indigo-400" />,
        title: "Compliance & Audit",
        description: "All actions are logged on the blockchain. Generate compliance reports anytime.",
        tip: "Immutable audit trail for regulatory requirements"
    }
];

interface OnboardingWalkthroughProps {
    role: "Patient" | "Doctor" | "Hospital";
    onComplete?: () => void;
}

export function OnboardingWalkthrough({ role, onComplete }: OnboardingWalkthroughProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const steps = role === "Patient" ? patientSteps :
        role === "Doctor" ? doctorSteps : hospitalSteps;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        // Save to localStorage so it doesn't show again
        localStorage.setItem(`healthchain_onboarding_${role.toLowerCase()}`, "completed");
        onComplete?.();
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md mx-4"
                >
                    {/* Skip button */}
                    <button
                        onClick={handleSkip}
                        className="absolute -top-12 right-0 text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
                    >
                        Skip tour <X className="w-4 h-4" />
                    </button>

                    {/* Card */}
                    <div className="bg-gradient-to-b from-zinc-900 to-black rounded-3xl border border-white/10 overflow-hidden">
                        {/* Progress bar */}
                        <div className="h-1 bg-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-center"
                                >
                                    {/* Icon */}
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                        {steps[currentStep].icon}
                                    </div>

                                    {/* Step indicator */}
                                    <div className="flex items-center justify-center gap-1 mb-4">
                                        {steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all ${i === currentStep
                                                        ? "w-6 bg-cyan-500"
                                                        : i < currentStep
                                                            ? "w-1.5 bg-cyan-500/50"
                                                            : "w-1.5 bg-white/20"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl font-bold text-white mb-3">
                                        {steps[currentStep].title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-gray-400 mb-6 leading-relaxed">
                                        {steps[currentStep].description}
                                    </p>

                                    {/* Tip */}
                                    {steps[currentStep].tip && (
                                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                                            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
                                                <Sparkles className="w-4 h-4" />
                                                <span>{steps[currentStep].tip}</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className="text-gray-400 hover:text-white disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>

                            <span className="text-xs text-gray-600 font-mono">
                                {currentStep + 1} / {steps.length}
                            </span>

                            <Button
                                onClick={handleNext}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white"
                            >
                                {currentStep === steps.length - 1 ? (
                                    <>Get Started</>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Hook to check if onboarding should be shown
 */
export function useOnboarding(role: "Patient" | "Doctor" | "Hospital") {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(`healthchain_onboarding_${role.toLowerCase()}`);
        if (!completed) {
            // Small delay to let the page load first
            const timer = setTimeout(() => setShowOnboarding(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [role]);

    const completeOnboarding = () => {
        setShowOnboarding(false);
        localStorage.setItem(`healthchain_onboarding_${role.toLowerCase()}`, "completed");
    };

    const resetOnboarding = () => {
        localStorage.removeItem(`healthchain_onboarding_${role.toLowerCase()}`);
        setShowOnboarding(true);
    };

    return { showOnboarding, completeOnboarding, resetOnboarding };
}
