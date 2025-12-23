"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Fingerprint, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function AuthDialog() {
    const { isConnected, isAuthenticated, authenticateUser } = useAppStore();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"biometric" | "seed" | "done">("biometric");
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isConnected && !isAuthenticated) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [isConnected, isAuthenticated]);

    const handleBiometric = () => {
        toast.info("Scanning Face ID...", { duration: 1000 });
        setTimeout(() => {
            setStep("seed");
            toast.success("Identity Verified");
        }, 1500);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText("witch collapse practice feed shame open despair creek road again ice least");
        setCopied(true);
        toast.success("Seed phrase copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFinish = () => {
        authenticateUser();
        setOpen(false);
        toast.success("Authentication Complete", { description: "You now have full access." });
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-primary/20 [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                        {step === "biometric" ? "Verify Identity" : "Secure Your Wallet"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {step === "biometric" ? "Authenticate to decrypt your medical records." : "Backup your recovery phrase."}
                    </DialogDescription>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {step === "biometric" && (
                        <motion.div
                            key="bio"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center py-6 space-y-6"
                        >
                            <div className="relative group cursor-pointer" onClick={handleBiometric}>
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
                                <div className="relative bg-black border border-primary/50 p-6 rounded-full group-hover:scale-105 transition-transform duration-300">
                                    <Fingerprint className="h-12 w-12 text-primary" />
                                </div>
                            </div>
                            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleBiometric}>
                                Use Face ID / Touch ID
                            </Button>
                        </motion.div>
                    )}

                    {step === "seed" && (
                        <motion.div
                            key="seed"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="space-y-6 py-4"
                        >
                            <div className="bg-muted/30 p-4 rounded-lg border border-border relative overflow-hidden group">
                                <div className={`grid grid-cols-3 gap-2 font-mono text-sm active:text-primary ${revealed ? "" : "blur-sm select-none"}`}>
                                    {[
                                        "witch", "collapse", "practice",
                                        "feed", "shame", "open",
                                        "despair", "creek", "road",
                                        "again", "ice", "least"
                                    ].map((word, i) => (
                                        <div key={i}><span className="text-muted-foreground mr-1">{i + 1}.</span>{word}</div>
                                    ))}
                                </div>
                                {!revealed && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                                        <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
                                            <Eye className="mr-2 h-3 w-3" /> Reveal Phrase
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={handleCopy} disabled={!revealed}>
                                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                                <Button className="flex-1" onClick={handleFinish} disabled={!revealed}>
                                    I Saved It
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
