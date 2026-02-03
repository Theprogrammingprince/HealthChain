"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    KeyRound,
    ShieldCheck,
    Activity,
    ArrowRight,
    Search,
    UserCheck,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestAccessByCode } from "@/lib/database.service";
import { useAppStore } from "@/lib/store";

export function AccessCodeScanner() {
    const { supabaseUser, currentStaff } = useAppStore();
    const [code, setCode] = useState("");
    const [isRequesting, setIsRequesting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "pending">("idle");

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setIsRequesting(true);
        setStatus("pending");
        try {
            const accessorName = currentStaff?.name || "Verified Clinical Provider";
            const result = await requestAccessByCode(code, supabaseUser?.id || "", accessorName);

            if (result.error) {
                toast.error("Request Failed", { description: result.error });
                setStatus("idle");
            } else {
                toast.success("Access Request Sent", {
                    description: "Waiting for patient to approve via their dashboard."
                });
                setStatus("success");
                // Reset after delay
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus("idle");
                    setCode("");
                }, 3000);
            }
        } catch (error) {
            console.error("Access request failed:", error);
            toast.error("An error occurred");
            setStatus("idle");
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="h-14 px-8 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-black rounded-2xl hover:bg-emerald-500/10 transition-all uppercase tracking-widest text-xs flex items-center gap-3">
                    <KeyRound size={16} />
                    Request Consent Access
                </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                        <Lock size={24} />
                    </div>
                    <DialogTitle className="text-xl font-bold">Patient Consent Access</DialogTitle>
                    <DialogDescription className="text-gray-400 pt-2">
                        Enter the 6-digit one-time access code provided by the patient to request temporary full access to their medical records.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <AnimatePresence mode="wait">
                        {status === "idle" || status === "pending" ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleRequest}
                                className="space-y-4"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
                                    <Input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                                        placeholder="ENTER 6-DIGIT CODE"
                                        className="relative bg-zinc-900 border-white/10 text-white h-16 text-center text-3xl font-mono tracking-[0.5em] focus:border-emerald-500/50 transition-all rounded-xl"
                                        disabled={isRequesting}
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isRequesting || code.length !== 6}
                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest"
                                >
                                    {isRequesting ? (
                                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                    )}
                                    Send Access Request
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-4 space-y-4 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <UserCheck size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Request Sent!</h4>
                                    <p className="text-gray-400 text-sm mt-1">
                                        The patient has been notified. This window will close automatically.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] text-emerald-200/60 leading-relaxed uppercase tracking-wider font-bold">
                        Audited cryptographic session protocol active. All access attempts are immutably logged to the patient&apos;s activity ledger.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
