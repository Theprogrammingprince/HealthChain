"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import {
    ShieldAlert,
    Download,
    Printer,
    Share2,
    Lock,
    HeartPulse
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";

export function EmergencyQRDialog() {
    const { walletAddress, userVitals } = useAppStore();
    const [open, setOpen] = useState(false);

    // Fake secure link to emergency profile
    const emergencyUrl = `https://healthchain.com/emergency/${walletAddress || 'demo'}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full h-16 border-red-500/30 hover:bg-red-500/5 hover:border-red-500 text-red-500 transition-all group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ShieldAlert className="mr-2 h-5 w-5 animate-pulse" />
                    <div className="text-left">
                        <p className="font-bold text-sm">Emergency QR Code</p>
                        <p className="text-[10px] text-red-500/60 uppercase tracking-widest">Global Rescue ID</p>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white p-8">
                <DialogHeader className="items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <HeartPulse className="text-red-500 w-8 h-8" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Emergency Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        First responders can scan this code to see your critical vitals and allergies without needing your password.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-8 py-6">
                    {/* QR Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-white rounded-3xl shadow-2xl shadow-red-500/20 border-8 border-red-500/10"
                    >
                        <QRCodeSVG
                            value={emergencyUrl}
                            size={200}
                            level="H"
                            includeMargin={false}
                            className="rounded-lg"
                        />
                    </motion.div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-sans">Blood Type</p>
                            <p className="text-lg font-bold text-red-500">{userVitals.bloodType}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-sans">Allergies</p>
                            <p className="text-[11px] font-bold text-white truncate">{userVitals.allergies.join(", ")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-500 text-xs bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                        <Lock className="w-3 h-3" />
                        <span>End-to-End Encrypted Access Control</span>
                    </div>
                </div>

                <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-start">
                    <Button variant="outline" onClick={handlePrint} className="border-white/10 text-gray-400 hover:text-white">
                        <Printer className="w-4 h-4 mr-2" />
                        Print ID
                    </Button>
                    <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Save Image
                    </Button>
                    <Button className="col-span-2 bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share with Family
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
