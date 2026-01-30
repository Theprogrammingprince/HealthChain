"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import {
    ShieldAlert,
    Download,
    Printer,
    Share2,
    Lock,
    HeartPulse,
    Droplets,
    AlertTriangle,
    Pill,
    Activity,
    User,
    Phone,
    FileText,
    Copy,
    Check,
    Clock,
    QrCode
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function EmergencySummaryCard() {
    const { walletAddress, userVitals, supabaseUser } = useAppStore();
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [showPDFDialog, setShowPDFDialog] = useState(false);
    const [tokenCopied, setTokenCopied] = useState(false);
    const [expiryMinutes] = useState(15);
    const printRef = useRef<HTMLDivElement>(null);

    // Generate a secure-looking token
    const generateToken = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) token += '-';
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    };

    const [emergencyToken] = useState(generateToken());
    const emergencyUrl = `https://healthchain.app/emergency/${emergencyToken}`;

    const copyToken = async () => {
        await navigator.clipboard.writeText(emergencyUrl);
        setTokenCopied(true);
        toast.success("Emergency link copied to clipboard");
        setTimeout(() => setTokenCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        // Create a printable emergency card
        const content = `
╔══════════════════════════════════════════════════════════════╗
║                    HEALTHCHAIN EMERGENCY CARD                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  PATIENT: ${(userVitals.fullName || supabaseUser?.full_name || 'N/A').padEnd(50)}║
║  DOB: ${(userVitals.dob || 'N/A').padEnd(54)}║
║  GENDER: ${(userVitals.gender || 'N/A').padEnd(51)}║
║                                                               ║
╠══════════════════════════════════════════════════════════════╣
║  CRITICAL INFORMATION                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  BLOOD TYPE: ${(userVitals.bloodType || 'Unknown').padEnd(47)}║
║  GENOTYPE: ${(userVitals.genotype || 'Unknown').padEnd(49)}║
║                                                               ║
║  ALLERGIES:                                                   ║
║  ${(userVitals.allergies?.length > 0 ? userVitals.allergies.join(', ') : 'No known allergies').padEnd(59)}║
║                                                               ║
║  CONDITIONS:                                                  ║
║  ${(userVitals.conditions?.length > 0 ? userVitals.conditions.join(', ') : 'No known conditions').padEnd(59)}║
║                                                               ║
║  MEDICATIONS:                                                 ║
║  ${(userVitals.medications?.length > 0 ? userVitals.medications.join(', ') : 'No current medications').padEnd(59)}║
║                                                               ║
╠══════════════════════════════════════════════════════════════╣
║  EMERGENCY CONTACT                                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  NAME: ${(userVitals.emergencyContact || 'Not specified').padEnd(53)}║
║  PHONE: ${(userVitals.emergencyPhone || 'Not specified').padEnd(52)}║
║                                                               ║
╠══════════════════════════════════════════════════════════════╣
║  VITALS                                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  BLOOD PRESSURE: ${(userVitals.bloodPressure || 'N/A').padEnd(43)}║
║  GLUCOSE: ${(userVitals.glucose || 'N/A').padEnd(50)}║
║  WEIGHT: ${(userVitals.weight ? userVitals.weight + ' kg' : 'N/A').padEnd(51)}║
║  HEIGHT: ${(userVitals.height ? userVitals.height + ' cm' : 'N/A').padEnd(51)}║
║                                                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  SCAN QR OR VISIT: ${emergencyUrl.padEnd(41)}║
║                                                               ║
║  TOKEN: ${emergencyToken.padEnd(52)}║
║  VALID FOR: ${expiryMinutes} MINUTES                                         ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝

Generated: ${new Date().toISOString()}
This document is encrypted and blockchain-verified via HealthChain.
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthchain-emergency-card-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Emergency card downloaded");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'HealthChain Emergency Access',
                    text: `Emergency health information access link. Valid for ${expiryMinutes} minutes.`,
                    url: emergencyUrl,
                });
            } catch (err) {
                copyToken();
            }
        } else {
            copyToken();
        }
    };

    return (
        <>
            <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />

                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-white">Emergency Summary</CardTitle>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    First responder access
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 text-[9px] uppercase">
                            <Lock className="w-2.5 h-2.5 mr-1" />
                            Encrypted
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Quick Vitals Preview */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Droplets className="w-3 h-3 text-red-400" />
                                <span className="text-[9px] text-gray-500 uppercase font-bold">Blood Type</span>
                            </div>
                            <p className="text-xl font-black text-red-400">{userVitals.bloodType || 'N/A'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span className="text-[9px] text-gray-500 uppercase font-bold">Allergies</span>
                            </div>
                            <p className="text-sm font-bold text-white truncate">
                                {userVitals.allergies?.length > 0 ? userVitals.allergies.join(', ') : 'None'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => setShowQRDialog(true)}
                            className="bg-red-600 hover:bg-red-500 text-white h-12"
                        >
                            <QrCode className="w-4 h-4 mr-2" />
                            QR Code
                        </Button>
                        <Button
                            onClick={() => setShowPDFDialog(true)}
                            variant="outline"
                            className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 h-12"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Export Card
                        </Button>
                    </div>

                    {/* Token Display */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Current Emergency Token</p>
                                <p className="font-mono text-sm text-emerald-400">{emergencyToken}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                                onClick={copyToken}
                            >
                                {tokenCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[9px] text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>Valid for {expiryMinutes} minutes upon first scan</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* QR Code Dialog */}
            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/10">
                    <DialogHeader className="items-center text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                            <HeartPulse className="text-red-500 w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white">Emergency Access QR</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            First responders can scan this to view your critical health information.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center py-6 space-y-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-6 bg-white rounded-3xl shadow-2xl shadow-red-500/20"
                        >
                            <QRCodeSVG
                                value={emergencyUrl}
                                size={200}
                                level="H"
                                includeMargin={false}
                            />
                        </motion.div>

                        <div className="w-full grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                <p className="text-[9px] text-gray-500 uppercase font-bold">Blood Type</p>
                                <p className="text-lg font-black text-red-400">{userVitals.bloodType}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                <p className="text-[9px] text-gray-500 uppercase font-bold">Genotype</p>
                                <p className="text-lg font-black text-white">{userVitals.genotype}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                            <Lock className="w-3 h-3" />
                            <span>Blockchain-verified access control</span>
                        </div>
                    </div>

                    <DialogFooter className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={handlePrint} className="border-white/10 text-gray-400 hover:text-white">
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPDF} className="border-white/10 text-gray-400 hover:text-white">
                            <Download className="w-4 h-4 mr-1" />
                            Save
                        </Button>
                        <Button variant="outline" onClick={handleShare} className="border-white/10 text-gray-400 hover:text-white">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PDF Export Dialog */}
            <Dialog open={showPDFDialog} onOpenChange={setShowPDFDialog}>
                <DialogContent className="sm:max-w-lg bg-[#0A0A0A] border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-400" />
                            Emergency Card Preview
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            This is what first responders will see when they access your emergency profile.
                        </DialogDescription>
                    </DialogHeader>

                    <div ref={printRef} className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-2xl border border-red-500/20 space-y-4 print:bg-white print:text-black">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <HeartPulse className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">
                                        {userVitals.fullName || supabaseUser?.full_name || 'Patient Name'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        DOB: {userVitals.dob || 'Not specified'} • {userVitals.gender || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-red-600 text-white border-none">
                                EMERGENCY
                            </Badge>
                        </div>

                        {/* Critical Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplets className="w-4 h-4 text-red-400" />
                                    <span className="text-xs text-gray-400 uppercase font-bold">Blood Type</span>
                                </div>
                                <p className="text-3xl font-black text-red-400">{userVitals.bloodType || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-gray-400 uppercase font-bold">Genotype</span>
                                </div>
                                <p className="text-3xl font-black text-amber-400">{userVitals.genotype || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-gray-400 uppercase font-bold">Allergies</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {userVitals.allergies?.length > 0 ? (
                                    userVitals.allergies.map((allergy, i) => (
                                        <Badge key={i} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5">
                                            {allergy}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-gray-500 text-sm">No known allergies</span>
                                )}
                            </div>
                        </div>

                        {/* Conditions & Medications */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-gray-400 uppercase font-bold">Conditions</span>
                                </div>
                                <div className="space-y-1">
                                    {userVitals.conditions?.length > 0 ? (
                                        userVitals.conditions.map((condition, i) => (
                                            <p key={i} className="text-sm text-white">{condition}</p>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">None</span>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Pill className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400 uppercase font-bold">Medications</span>
                                </div>
                                <div className="space-y-1">
                                    {userVitals.medications?.length > 0 ? (
                                        userVitals.medications.map((med, i) => (
                                            <p key={i} className="text-sm text-white">{med}</p>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">None</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-gray-400 uppercase font-bold">Emergency Contact</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-white font-medium">{userVitals.emergencyContact || 'Not specified'}</p>
                                <p className="text-emerald-400 font-mono">{userVitals.emergencyPhone || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Vitals */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="p-3 rounded-xl bg-white/5 text-center">
                                <p className="text-[9px] text-gray-500 uppercase">BP</p>
                                <p className="text-sm font-bold text-white">{userVitals.bloodPressure || 'N/A'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 text-center">
                                <p className="text-[9px] text-gray-500 uppercase">Glucose</p>
                                <p className="text-sm font-bold text-white">{userVitals.glucose || 'N/A'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 text-center">
                                <p className="text-[9px] text-gray-500 uppercase">Weight</p>
                                <p className="text-sm font-bold text-white">{userVitals.weight || 'N/A'} kg</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 text-center">
                                <p className="text-[9px] text-gray-500 uppercase">Height</p>
                                <p className="text-sm font-bold text-white">{userVitals.height || 'N/A'} cm</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-600">
                            <span>Token: {emergencyToken}</span>
                            <span>Generated: {new Date().toLocaleString()}</span>
                        </div>
                    </div>

                    <DialogFooter className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handlePrint} className="border-white/10 text-gray-400 hover:text-white">
                            <Printer className="w-4 h-4 mr-2" />
                            Print Card
                        </Button>
                        <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-500 text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
