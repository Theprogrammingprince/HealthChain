"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    QrCode,
    Scan,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Shield,
    Activity,
    Loader2,
    X,
    KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { getEmergencyProfile, logEmergencyAccess } from "@/lib/database.service";
import { useRouter } from "next/navigation";

interface EmergencyPatientData {
    fullName: string;
    dateOfBirth: string | null;
    gender: string | null;
    bloodType: string;
    genotype: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    bloodPressure: string | null;
    glucose: string | null;
    weight: string | null;
    height: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    lastUpdated: string;
}

export function EmergencyAccessTab() {
    console.log("EmergencyAccessTab component mounted");
    const router = useRouter();
    const [mode, setMode] = useState<'select' | 'qr' | 'otp'>('select');
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [patientData, setPatientData] = useState<EmergencyPatientData | null>(null);
    const [accessGrantedAt, setAccessGrantedAt] = useState<Date | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleOTPVerification = async () => {
        if (!otpCode || otpCode.length < 6) {
            toast.error("Invalid OTP", { description: "Please enter a valid 6-digit code" });
            return;
        }

        setIsVerifying(true);
        try {
            console.log("Searching for token:", otpCode.toUpperCase());
            
            // Query emergency_access_tokens table
            const { data: tokenData, error: tokenError } = await supabase
                .from('emergency_access_tokens')
                .select('*')
                .eq('token', otpCode.toUpperCase())
                .eq('is_active', true)
                .single();

            console.log("Token query result:", { tokenData, tokenError });

            if (tokenError || !tokenData) {
                console.error("Token verification failed:", tokenError);
                toast.error("Invalid or Expired OTP", { description: "The code you entered is not valid or has expired." });
                setIsVerifying(false);
                return;
            }

            // Check if token is expired
            const expiresAt = new Date(tokenData.expires_at);
            if (expiresAt < new Date()) {
                toast.error("OTP Expired", { description: "This emergency access code has expired." });
                
                // Mark token as inactive
                await supabase
                    .from('emergency_access_tokens')
                    .update({ is_active: false })
                    .eq('id', tokenData.id);
                
                setIsVerifying(false);
                return;
            }

            // Fetch patient emergency profile
            const profile = await getEmergencyProfile(tokenData.patient_id);
            
            if (!profile) {
                toast.error("Error", { description: "Could not retrieve patient data." });
                setIsVerifying(false);
                return;
            }

            // Get current doctor info
            const { data: { user } } = await supabase.auth.getUser();
            const { data: doctorProfile } = await supabase
                .from('doctor_profiles')
                .select('first_name, last_name')
                .eq('user_id', user?.id)
                .single();

            const doctorName = doctorProfile 
                ? `Dr. ${doctorProfile.first_name} ${doctorProfile.last_name}`
                : 'Emergency Doctor';

            // Log emergency access
            await logEmergencyAccess(tokenData.patient_id, doctorName, 'Doctor');

            // Mark token as used
            await supabase
                .from('emergency_access_tokens')
                .update({ 
                    is_active: false,
                    used_at: new Date().toISOString(),
                    used_by: user?.id
                })
                .eq('id', tokenData.id);

            setPatientData(profile);
            setAccessGrantedAt(new Date());
            toast.success("Emergency Access Granted", { 
                description: `Accessing ${profile.fullName}'s critical medical data` 
            });

        } catch (error) {
            console.error("OTP verification error:", error);
            toast.error("Verification Failed", { description: "An error occurred during verification." });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleQRScan = async (scannedData: string) => {
        // Extract token from QR code URL or direct token
        let token = scannedData;
        if (scannedData.includes('/emergency/')) {
            const parts = scannedData.split('/');
            token = parts[parts.length - 1];
        }

        setOtpCode(token);
        await handleOTPVerification();
    };

    const startQRScanner = async () => {
        setIsScanning(true);
        setMode('qr');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Camera access error:", error);
            toast.error("Camera Access Denied", { 
                description: "Please allow camera access to scan QR codes" 
            });
            setIsScanning(false);
            setMode('select');
        }
    };

    const stopQRScanner = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsScanning(false);
        setMode('select');
    };

    const closeAccess = () => {
        setPatientData(null);
        setAccessGrantedAt(null);
        setOtpCode('');
        setMode('select');
    };

    if (patientData && accessGrantedAt) {
        return (
            <div className="space-y-6">
                {/* Access Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                                <Shield className="w-7 h-7 text-red-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Emergency Access Active</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    Granted: {accessGrantedAt.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={closeAccess}
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Close Access
                        </Button>
                    </div>
                </motion.div>

                {/* Patient Critical Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Patient Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Full Name</p>
                                <p className="text-lg font-bold text-white">{patientData.fullName}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Blood Type</p>
                                    <p className="text-2xl font-black text-red-400">{patientData.bloodType}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Genotype</p>
                                    <p className="text-2xl font-black text-purple-400">{patientData.genotype}</p>
                                </div>
                            </div>

                            {patientData.dateOfBirth && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Date of Birth</p>
                                    <p className="text-base font-bold text-white">{new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                                <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Allergies
                                </p>
                                {patientData.allergies && patientData.allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patientData.allergies.map((allergy, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-300">
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No known allergies</p>
                                )}
                            </div>

                            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-2">Current Medications</p>
                                {patientData.medications && patientData.medications.length > 0 ? (
                                    <ul className="space-y-1">
                                        {patientData.medications.map((med, i) => (
                                            <li key={i} className="text-sm text-white font-medium">• {med}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No current medications</p>
                                )}
                            </div>

                            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Conditions</p>
                                {patientData.conditions && patientData.conditions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {patientData.conditions.map((condition, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-300">
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No known conditions</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    {(patientData.emergencyContact || patientData.emergencyPhone) && (
                        <div className="mt-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Emergency Contact</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {patientData.emergencyContact && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                        <p className="text-sm font-bold text-white">{patientData.emergencyContact}</p>
                                    </div>
                                )}
                                {patientData.emergencyPhone && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                        <p className="text-sm font-bold text-white">{patientData.emergencyPhone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Vitals */}
                {(patientData.bloodPressure || patientData.glucose || patientData.weight || patientData.height) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Recent Vitals</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {patientData.bloodPressure && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Blood Pressure</p>
                                    <p className="text-xl font-black text-white">{patientData.bloodPressure}</p>
                                </div>
                            )}
                            {patientData.glucose && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Glucose</p>
                                    <p className="text-xl font-black text-white">{patientData.glucose}</p>
                                </div>
                            )}
                            {patientData.weight && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Weight</p>
                                    <p className="text-xl font-black text-white">{patientData.weight}</p>
                                </div>
                            )}
                            {patientData.height && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Height</p>
                                    <p className="text-xl font-black text-white">{patientData.height}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Emergency Access</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Scan QR Code or Enter Patient OTP
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* QR Scanner Option */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={startQRScanner}
                            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-10 cursor-pointer group hover:border-blue-500/40 transition-all"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500/30 transition-all">
                                    <Scan className="w-10 h-10 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">Scan QR Code</h3>
                                    <p className="text-sm text-gray-400 font-medium">
                                        Use your camera to scan the patient's emergency QR code
                                    </p>
                                </div>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase tracking-widest px-8">
                                    <QrCode className="w-5 h-5 mr-2" />
                                    Start Scanner
                                </Button>
                            </div>
                        </motion.div>

                        {/* OTP Input Option */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setMode('otp')}
                            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-10 cursor-pointer group hover:border-emerald-500/40 transition-all"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-all">
                                    <KeyRound className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">Enter OTP Code</h3>
                                    <p className="text-sm text-gray-400 font-medium">
                                        Manually input the 6-digit emergency access code
                                    </p>
                                </div>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest px-8">
                                    <KeyRound className="w-5 h-5 mr-2" />
                                    Enter Code
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {mode === 'qr' && (
                    <motion.div
                        key="qr"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">QR Code Scanner</h3>
                            <Button onClick={stopQRScanner} variant="ghost" className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5 mr-2" />
                                Cancel
                            </Button>
                        </div>

                        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 border-4 border-blue-500/50 rounded-2xl pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-blue-500 rounded-2xl animate-pulse"></div>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-400 mt-6 font-medium">
                            Position the QR code within the frame to scan
                        </p>
                    </motion.div>
                )}

                {mode === 'otp' && (
                    <motion.div
                        key="otp"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Enter Emergency OTP</h3>
                            <Button onClick={() => setMode('select')} variant="ghost" className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5 mr-2" />
                                Back
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                                    6-Digit Access Code
                                </label>
                                <Input
                                    type="text"
                                    placeholder="ABC123"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    className="h-16 text-center text-3xl font-mono font-bold tracking-widest bg-white/5 border-white/20 focus:border-emerald-500 text-white"
                                />
                            </div>

                            <Button
                                onClick={handleOTPVerification}
                                disabled={isVerifying || otpCode.length < 6}
                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-lg"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Verify & Access
                                    </>
                                )}
                            </Button>

                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Important</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Emergency access codes expire after 15 minutes. All access is logged and audited for compliance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-2xl p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Emergency Access Protocol</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Emergency access provides immediate visibility into critical patient information including allergies, medications, blood type, and emergency contacts. All access events are cryptographically logged on-chain and require patient-generated OTP codes that expire after 15 minutes.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
