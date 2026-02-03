"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    QrCode,
    RefreshCcw,
    Clock,
    ShieldCheck,
    MonitorSmartphone,
    Copy,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createPatientAccessCode } from "@/lib/database.service";
import { useAppStore } from "@/lib/store";

export function ConsentCodeGenerator() {
    const { supabaseUser } = useAppStore();
    const [code, setCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    const generateCode = async () => {
        if (!supabaseUser) return;
        setIsLoading(true);
        try {
            const result = await createPatientAccessCode(supabaseUser.id, 10); // 10 minutes
            setCode(result.code);
            setExpiresAt(new Date(result.expires_at));
            setTimeLeft(600); // 10 minutes in seconds
            toast.success("Access Code Generated", {
                description: "This code will expire in 10 minutes."
            });
        } catch (error) {
            console.error("Failed to generate code:", error);
            toast.error("Generation Failed", {
                description: "Could not create access code. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!expiresAt) return;

        const timer = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

            if (diff <= 0) {
                setCode(null);
                setExpiresAt(null);
                setTimeLeft(0);
                clearInterval(timer);
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
            toast.success("Copied to clipboard");
        }
    };

    return (
        <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative glass-card bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {!code ? (
                        <motion.div
                            key="initial"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                                <QrCode size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Full Access Consent</h3>
                                <p className="text-gray-400 text-sm max-w-[280px] mt-2">
                                    Generate a one-time code to grant temporary full access to a verified hospital or doctor.
                                </p>
                            </div>
                            <Button
                                onClick={generateCode}
                                disabled={isLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-emerald-500/20"
                            >
                                {isLoading ? (
                                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                )}
                                Generate Secure Code
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-6 w-full max-w-[320px]"
                        >
                            <div className="flex items-center justify-between w-full mb-2">
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-3 py-1">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    Expires in {formatTime(timeLeft)}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateCode}
                                    className="text-gray-500 hover:text-white hover:bg-white/5 h-8 px-2"
                                >
                                    <RefreshCcw className="w-3 h-3 mr-1.5" />
                                    Regenerate
                                </Button>
                            </div>

                            <div className="relative p-4 bg-white rounded-xl shadow-2xl shadow-emerald-500/10 inline-block mx-auto mb-4">
                                <QRCodeSVG
                                    value={code}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#000000"
                                />
                                <div className="absolute inset-0 border-[6px] border-white/5 rounded-xl pointer-events-none"></div>
                            </div>

                            <div className="relative group/code cursor-pointer" onClick={copyToClipboard}>
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur opacity-50 group-hover/code:opacity-100 transition duration-500"></div>
                                <div className="relative bg-zinc-950/80 border border-white/10 rounded-xl p-3 flex items-center justify-center gap-4">
                                    <span className="text-3xl font-mono font-black tracking-[0.4em] text-white pl-[0.2em] uppercase">
                                        {code}
                                    </span>
                                    <div className="h-6 w-px bg-white/10"></div>
                                    {hasCopied ? (
                                        <Check className="text-emerald-500 w-5 h-5" />
                                    ) : (
                                        <Copy className="text-gray-500 group-hover/code:text-white w-5 h-5" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-4">
                                <MonitorSmartphone size={14} />
                                <span>Show this to your healthcare provider</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-tl-full -mr-12 -mb-12 blur-2xl"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-br-full -ml-16 -mt-16 blur-3xl"></div>
            </div>
        </div>
    );
}
