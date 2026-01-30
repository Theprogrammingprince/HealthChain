"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Lock,
    FileText,
    CheckCircle2,
    ExternalLink,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface ConsentDisclaimerProps {
    open: boolean;
    onAccept: () => void;
    onDecline?: () => void;
    userType?: "patient" | "doctor" | "hospital";
}

export function ConsentDisclaimer({
    open,
    onAccept,
    onDecline,
    userType = "patient"
}: ConsentDisclaimerProps) {
    const [agreements, setAgreements] = useState({
        dataCollection: false,
        dataSharing: false,
        termsOfService: false,
        privacyPolicy: false
    });

    const allAgreed = Object.values(agreements).every(Boolean);

    const handleAccept = () => {
        if (allAgreed) {
            // Store consent in localStorage
            localStorage.setItem("healthchain_consent", JSON.stringify({
                timestamp: new Date().toISOString(),
                userType,
                agreements
            }));
            onAccept();
        }
    };

    const toggleAgreement = (key: keyof typeof agreements) => {
        setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-lg bg-[#0A0A0A] border-white/10 p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">
                                Data Use Agreement
                            </DialogTitle>
                            <DialogDescription className="text-gray-500">
                                Please review and accept our policies
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[400px]">
                    <div className="p-6 space-y-6">
                        {/* Introduction */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-300">
                                        HealthChain is committed to protecting your health data.
                                        Before you continue, please review and agree to how we collect,
                                        store, and use your information.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Data Collection */}
                        <ConsentItem
                            icon={<FileText className="w-5 h-5 text-cyan-400" />}
                            title="Data Collection"
                            description="We collect health records, profile information, and activity data to provide our services."
                            details={[
                                "Medical records submitted by healthcare providers",
                                "Personal information you provide",
                                "Access logs and audit trails",
                                "Device information for security"
                            ]}
                            checked={agreements.dataCollection}
                            onToggle={() => toggleAgreement("dataCollection")}
                        />

                        {/* Data Sharing */}
                        <ConsentItem
                            icon={<Lock className="w-5 h-5 text-amber-400" />}
                            title="Data Sharing & Access"
                            description="Your data is only shared with parties you explicitly authorize."
                            details={[
                                "You control who accesses your records",
                                "Healthcare providers can request access",
                                "Emergency responders can use your QR code",
                                "We never sell your data to third parties"
                            ]}
                            checked={agreements.dataSharing}
                            onToggle={() => toggleAgreement("dataSharing")}
                        />

                        {/* Terms of Service */}
                        <ConsentItem
                            icon={<FileText className="w-5 h-5 text-indigo-400" />}
                            title="Terms of Service"
                            description="By using HealthChain, you agree to our terms of service."
                            link="/terms"
                            linkText="Read Terms of Service"
                            checked={agreements.termsOfService}
                            onToggle={() => toggleAgreement("termsOfService")}
                        />

                        {/* Privacy Policy */}
                        <ConsentItem
                            icon={<Shield className="w-5 h-5 text-emerald-400" />}
                            title="Privacy Policy"
                            description="Understand how we protect and handle your personal data."
                            link="/privacy"
                            linkText="Read Privacy Policy"
                            checked={agreements.privacyPolicy}
                            onToggle={() => toggleAgreement("privacyPolicy")}
                        />
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-4 border-t border-white/5 flex-col sm:flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span>Your consent is stored securely and can be withdrawn anytime</span>
                    </div>
                    <div className="flex gap-3 w-full">
                        {onDecline && (
                            <Button
                                variant="outline"
                                onClick={onDecline}
                                className="flex-1 border-white/10 text-gray-400 hover:text-white"
                            >
                                Decline
                            </Button>
                        )}
                        <Button
                            onClick={handleAccept}
                            disabled={!allAgreed}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            I Agree & Continue
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ConsentItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    details?: string[];
    link?: string;
    linkText?: string;
    checked: boolean;
    onToggle: () => void;
}

function ConsentItem({
    icon,
    title,
    description,
    details,
    link,
    linkText,
    checked,
    onToggle
}: ConsentItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${checked
                    ? "bg-white/5 border-emerald-500/30"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20"
                }`}
            onClick={onToggle}
        >
            <div className="flex gap-4">
                <div className="shrink-0">
                    <Checkbox
                        checked={checked}
                        onCheckedChange={onToggle}
                        className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {icon}
                        <h4 className="font-bold text-white text-sm">{title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{description}</p>

                    {details && (
                        <ul className="space-y-1 mb-2">
                            {details.map((detail, i) => (
                                <li key={i} className="text-[11px] text-gray-500 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    )}

                    {link && (
                        <Link
                            href={link}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest inline-flex items-center gap-1"
                        >
                            {linkText}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Hook to manage consent state
 */
export function useConsent() {
    const checkConsent = (): boolean => {
        if (typeof window === "undefined") return false;
        const consent = localStorage.getItem("healthchain_consent");
        return consent !== null;
    };

    const getConsentDetails = () => {
        if (typeof window === "undefined") return null;
        const consent = localStorage.getItem("healthchain_consent");
        return consent ? JSON.parse(consent) : null;
    };

    const withdrawConsent = () => {
        localStorage.removeItem("healthchain_consent");
    };

    return { checkConsent, getConsentDetails, withdrawConsent };
}
