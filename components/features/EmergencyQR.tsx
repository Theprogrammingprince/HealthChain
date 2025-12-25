"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { TriangleAlert, QrCode, Printer, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function EmergencyQR() {
    const [showPreview, setShowPreview] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="border-red-500/30 bg-background/60 backdrop-blur-xl shadow-[0_0_20px_rgba(239,68,68,0.1)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none"></div>

            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500">
                        <TriangleAlert className="h-5 w-5 animate-pulse" />
                        <CardTitle className="tracking-wide uppercase text-lg">Emergency Access</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="emergency-mode"
                            checked={showPreview}
                            onCheckedChange={setShowPreview}
                            className="data-[state=checked]:bg-red-500"
                        />
                        <Label htmlFor="emergency-mode" className="text-xs text-muted-foreground">Preview</Label>
                    </div>
                </div>
                <CardDescription>
                    Grant paramedics instant read-only access to vital data.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02]" size="lg">
                            <QrCode className="mr-2 h-5 w-5" /> Generate Emergency Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-red-500/20 bg-zinc-950">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-500">
                                <TriangleAlert className="h-5 w-5" /> Emergency Access Token
                            </DialogTitle>
                            <DialogDescription>
                                Valid for 15 minutes. Access is logged on the Polygon blockchain.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-6 space-y-6">
                            <div className="relative p-6 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] group">
                                <div className="absolute inset-0 border-4 border-red-500 rounded-xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
                                <QRCodeSVG value="https://healthchain.app/emergency/access/token" size={200} />
                            </div>
                            <div className="flex w-full gap-2">
                                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                                    <Printer className="mr-2 h-4 w-4" /> Print Card
                                </Button>
                                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                                    <Share2 className="mr-2 h-4 w-4" /> Share Link
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Blood Type</span>
                                    <span className="font-bold font-mono text-red-400">O+</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Allergies</span>
                                    <span className="font-bold text-white">Penicillin</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
