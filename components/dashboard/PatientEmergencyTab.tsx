"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    QrCode,
    AlertCircle,
    Clock,
    Shield,
    Copy,
    CheckCircle2,
    RefreshCw,
    Info,
    Siren,
    KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { QRCodeSVG } from "qrcode.react";
import { generateEmergencyToken } from "@/lib/database.service";

interface EmergencyToken {
    token: string;
    expiresAt: string;
    createdAt: string;
}

export function PatientEmergencyTab() {
    const [activeToken, setActiveToken] = useState<EmergencyToken | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [displayMode, setDisplayMode] = useState<'qr' | 'otp' | 'both'>('both');

    useEffect(() => {
        loadActiveToken();
        const interval = setInterval(loadActiveToken, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!activeToken) {
            setTimeRemaining("");
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const expiry = new Date(activeToken.expiresAt).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeRemaining("EXPIRED");
                setActiveToken(null);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [activeToken]);

    const loadActiveToken = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('emergency_access_tokens')
                .select('*')
                .eq('patient_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error loading token:", error);
                return;
            }

            if (data) {
                const expiresAt = new Date(data.expires_at);
                if (expiresAt > new Date()) {
                    setActiveToken({
                        token: data.token,
                        expiresAt: data.expires_at,
                        createdAt: data.created_at
                    });
                } else {
                    // Token expired, mark as inactive
                    await supabase
                        .from('emergency_access_tokens')
                        .update({ is_active: false })
                        .eq('id', data.id);
                }
            }
        } catch (error) {
            console.error("Error loading active token:", error);
        }
    };

    const generateNewToken = async () => {
        setIsGenerating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Authentication required");
                return;
            }

            // Deactivate any existing active tokens
            await supabase
                .from('emergency_access_tokens')
                .update({ is_active: false })
                .eq('patient_id', user.id)
                .eq('is_active', true);

            // Generate new token
            const token = generateEmergencyToken();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

            const { data, error } = await supabase
                .from('emergency_access_tokens')
                .insert({
                    patient_id: user.id,
                    token: token,
                    expires_at: expiresAt,
                    is_active: true
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating token:", error);
                toast.error("Failed to generate emergency code");
                return;
            }

            setActiveToken({
                token: data.token,
                expiresAt: data.expires_at,
                createdAt: data.created_at
            });

            toast.success("Emergency Access Code Generated", {
                description: "Valid for 15 minutes"
            });

        } catch (error) {
            console.error("Error generating token:", error);
            toast.error("An error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const formatToken = (token: string) => {
        // Format as XXX-XXX for better readability
        return token.slice(0, 3) + '-' + token.slice(3);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Emergency Access</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                    Generate secure codes for emergency medical access
                </p>
            </div>

            <AnimatePresence mode="wait">
                {activeToken ? (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* Active Token Display */}
                        <div className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/20 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                                        <Siren className="w-7 h-7 text-red-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Active Emergency Code</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-amber-400" />
                                            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
                                                Expires in: {timeRemaining}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={generateNewToken}
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white hover:bg-white/5"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* QR Code */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <QrCode className="w-5 h-5 text-blue-400" />
                                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">QR Code</h4>
                                    </div>
                                    <div className="flex justify-center p-6 bg-white rounded-2xl relative">
                                        <QRCodeSVG
                                            value={`https://healthchain.app/emergency/${activeToken.token}`}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-2xl pointer-events-none"></div>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center mt-4 font-medium">
                                        Scan with any QR code reader
                                    </p>
                                </div>

                                {/* OTP Code */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <KeyRound className="w-5 h-5 text-emerald-400" />
                                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Access Code</h4>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="text-5xl font-mono font-black text-white tracking-[0.3em] mb-4 select-all">
                                            {formatToken(activeToken.token)}
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(activeToken.token)}
                                            variant="outline"
                                            className="border-white/20 hover:bg-white/10 text-white"
                                        >
                                            {copied ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Code
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center font-medium">
                                        Share this code with emergency responders
                                    </p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">How to Use</p>
                                        <ul className="text-xs text-gray-400 space-y-1 leading-relaxed">
                                            <li>• Show the QR code to medical personnel for instant scanning</li>
                                            <li>• Or verbally provide the 6-digit access code</li>
                                            <li>• Code grants temporary read-only access to critical medical data</li>
                                            <li>• All access is logged and audited for your security</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="generate"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* Generate New Token */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
                            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                                <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                                    <Siren className="w-10 h-10 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-3">
                                        No Active Emergency Code
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Generate a secure emergency access code that allows medical professionals to view your critical health information during emergencies. The code expires after 15 minutes for your security.
                                    </p>
                                </div>
                                <Button
                                    onClick={generateNewToken}
                                    disabled={isGenerating}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest px-12 h-14 text-lg shadow-lg shadow-red-500/20"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Siren className="w-5 h-5 mr-2" />
                                            Generate Emergency Code
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Secure & Private</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Emergency codes are time-limited and grant read-only access to critical medical data only. All access events are cryptographically logged on the blockchain.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Clock className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Time-Limited Access</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Each emergency code expires after 15 minutes. You can generate a new code at any time, which will automatically invalidate the previous one.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What Information is Shared */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-6">Information Shared via Emergency Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: "Blood Type & Genotype", icon: "🩸" },
                        { label: "Known Allergies", icon: "⚠️" },
                        { label: "Current Medications", icon: "💊" },
                        { label: "Medical Conditions", icon: "🏥" },
                        { label: "Recent Vitals", icon: "📊" },
                        { label: "Emergency Contact Info", icon: "📞" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-sm font-medium text-white">{item.label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-6 italic">
                    Full medical records are NOT accessible via emergency codes. Only critical, life-saving information is shared.
                </p>
            </div>
        </div>
    );
}
