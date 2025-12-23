"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriangleAlert, QrCode, HeartPulse, Syringe, Pill } from "lucide-react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function EmergencyCard() {
    const [showQR, setShowQR] = useState(false);

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
        >
            <Card className="border-red-500/50 bg-destructive/5 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <CardHeader className="bg-red-500/10 border-b border-red-500/20 text-red-500">
                    <div className="flex items-center gap-2">
                        <TriangleAlert className="h-6 w-6 animate-pulse" />
                        <CardTitle className="text-xl tracking-wide uppercase font-black">Emergency ID</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Vital Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-red-500/20">
                            <div className="flex items-center gap-3">
                                <HeartPulse className="text-red-500 h-5 w-5" />
                                <span className="text-muted-foreground">Blood Type</span>
                            </div>
                            <span className="font-mono font-bold text-2xl text-red-500">O+</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-red-500/20">
                            <div className="flex items-center gap-3">
                                <Syringe className="text-orange-500 h-5 w-5" />
                                <span className="text-muted-foreground">Allergies</span>
                            </div>
                            <span className="font-semibold text-white">Penicillin, Peanuts</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-red-500/20">
                            <div className="flex items-center gap-3">
                                <Pill className="text-blue-500 h-5 w-5" />
                                <span className="text-muted-foreground">Medications</span>
                            </div>
                            <span className="font-semibold text-white">Insulin (Daily)</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pb-6">
                    <Dialog open={showQR} onOpenChange={setShowQR}>
                        <DialogTrigger asChild>
                            <Button className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20" size="lg">
                                <QrCode className="mr-2 h-5 w-5" /> Generate Emergency Access
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-zinc-950 border-red-500/50">
                            <DialogHeader>
                                <DialogTitle className="text-red-500 flex items-center gap-2">
                                    <TriangleAlert className="h-5 w-5" /> Emergency Access Token
                                </DialogTitle>
                                <DialogDescription>
                                    Scan this code to grant temporary read-only access to vital records.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                <div className="p-4 bg-white rounded-xl relative">
                                    <div className="absolute inset-0 border-2 border-red-500 animate-ping rounded-xl opacity-20"></div>
                                    <QRCodeSVG
                                        value="https://healthchain.app/emergency/access/token-12345"
                                        size={200}
                                        level="H"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                                    Token expires in 15 minutes. Access is logged on-chain.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
