"use client";

import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    ShieldAlert,
    Clock,
    AlertTriangle,
    HeartPulse,
    Droplet,
    ShieldCheck,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export function BreakGlassDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isActivating, setIsActivating] = useState(false);
    const [justification, setJustification] = useState("");
    const { userVitals, activateEmergency } = useAppStore();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 2 && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const handleActivate = async () => {
        setIsActivating(true);
        await new Promise(r => setTimeout(r, 1500)); // Simulate auth/sign
        setIsActivating(false);
        setStep(2);
        activateEmergency("p_8291");
        toast.error("EMERGENCY ACCESS ENABLED", {
            description: "Patient notified. All actions are being recorded to the immutable audit log.",
            icon: <ShieldAlert className="text-red-500" />
        });
    };

    const handleClose = () => {
        if (step === 2 && !justification) {
            toast.warning("Justification Required", {
                description: "Please provide a clinical note for the emergency access before closing."
            });
            return;
        }
        setOpen(false);
        setStep(1);
        setTimeLeft(300);
        setJustification("");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / 300) * 100;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#FF5252] hover:bg-[#FF5252]/90 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-red-500/20 animate-pulse active:scale-95 transition-all">
                    <ShieldAlert className="mr-2 h-6 w-6" />
                    EMERGENCY BREAK-GLASS
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-red-500/20 text-white p-0 overflow-hidden rounded-[2.5rem]">
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                <DialogHeader>
                                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-6 mx-auto">
                                        <AlertTriangle className="text-red-500 w-8 h-8" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black text-center text-red-100 tracking-tighter uppercase">
                                        Critical Access Warning
                                    </DialogTitle>
                                    <DialogDescription className="text-center text-gray-400 mt-2">
                                        You are initiating an emergency override. This action will bypass standard consent protocols for life-saving care.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-1">
                                            <ShieldAlert size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Legal Notice</p>
                                            <p className="text-[10px] text-gray-500 leading-relaxed mt-1 italic">
                                                By proceeding, you attest that this is a medical emergency. Your session ID and Wallet Signature will be tied to this intrusion on-chain.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleActivate}
                                    disabled={isActivating}
                                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-2xl"
                                >
                                    {isActivating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            SIGNING SECURE OVERRIDE...
                                        </>
                                    ) : (
                                        "PROCEED WITH OVERRIDE"
                                    )}
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-red-500/20 text-red-500 border-none font-black px-4 py-1 uppercase tracking-widest text-[10px] animate-pulse">
                                        EMERGENCY CHANNEL ACTIVE
                                    </Badge>
                                    <div className="flex items-center gap-2 text-xl font-mono font-bold text-red-500">
                                        <Clock size={20} />
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                                <Droplet size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Blood Type</p>
                                                <p className="text-lg font-black text-white">{userVitals.bloodType}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <HeartPulse size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Genotype</p>
                                                <p className="text-lg font-black text-white">{userVitals.genotype}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 border-dashed">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">Critical Allergies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {userVitals.allergies.map(a => (
                                                <Badge key={a} variant="outline" className="bg-red-500/10 border-red-500/30 text-white font-bold text-[10px]">
                                                    {a}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attending Note (Mandatory)</label>
                                    <Textarea
                                        placeholder="Type clinical justification for break-glass event..."
                                        className="bg-white/5 border-white/10 text-white min-h-[100px] rounded-xl focus:border-red-500/50"
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-red-500">
                                            <span>AUDIT SYNC Progress</span>
                                            <span>SECURED ON POLYGON</span>
                                        </div>
                                        <Progress value={100} className="h-1 bg-white/10" />
                                    </div>
                                    <Button
                                        onClick={handleClose}
                                        className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/5"
                                    >
                                        CLOSE & SAVE AUDIT
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
