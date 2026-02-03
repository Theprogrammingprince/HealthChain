"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldAlert,
    ShieldCheck,
    X,
    Clock,
    Activity,
    Lock
} from "lucide-react";
import { toast } from "sonner";
import { grantAccessPermission } from "@/lib/database.service";
import { useAppStore } from "@/lib/store";

export function AccessRequestModal() {
    const { supabaseUser } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const [requestData, setRequestData] = useState<any>(null);
    const [isGranting, setIsGranting] = useState(false);
    const [duration, setDuration] = useState(24); // Default 24 hours

    useEffect(() => {
        const handleNotification = (event: any) => {
            const notification = event.detail;
            if (notification.type === "access_request") {
                // Parse accessor ID from action link if needed, or it might be in metadata
                // For now, we'll assume the notification message has the info
                setRequestData(notification);
                setIsOpen(true);
            }
        };

        window.addEventListener("new_notification", handleNotification);
        return () => window.removeEventListener("new_notification", handleNotification);
    }, []);

    const handleApprove = async () => {
        if (!supabaseUser || !requestData) return;

        // Extract accessorId from the action_link: /patient/dashboard?action=approve_access&accessorId=...
        const url = new URL(requestData.action_link, window.location.origin);
        const accessorId = url.searchParams.get("accessorId");

        if (!accessorId) {
            toast.error("Invalid request data");
            return;
        }

        setIsGranting(true);
        try {
            await grantAccessPermission(
                supabaseUser.id,
                accessorId,
                'hospital', // Defaulting to hospital for now, could be passed in metadata
                duration,
                'full'
            );
            toast.success("Access Granted", {
                description: `Full access granted for ${duration} hours.`
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to grant access:", error);
            toast.error("Action Failed", {
                description: "Could not grant access. Please try again."
            });
        } finally {
            setIsGranting(false);
        }
    };

    const handleDeny = () => {
        setIsOpen(false);
        toast.info("Access Request Denied");
    };

    if (!requestData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                        <ShieldAlert size={24} />
                    </div>
                    <DialogTitle className="text-xl font-bold">Access Request Received</DialogTitle>
                    <DialogDescription className="text-gray-400 pt-2">
                        {requestData.message}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Request Info Card */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Access Scope</span>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">Full Clinical Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Security Level</span>
                            <div className="flex items-center gap-1 text-blue-400">
                                <Lock size={12} />
                                <span className="text-xs">End-to-End Encrypted</span>
                            </div>
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="space-y-3">
                        <label className="text-xs text-gray-400 uppercase tracking-wider block">Grant Access For</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 12, 24].map((h) => (
                                <button
                                    key={h}
                                    onClick={() => setDuration(h)}
                                    className={`
                                        py-2 px-3 rounded-lg border text-sm font-medium transition-all
                                        ${duration === h
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}
                                    `}
                                >
                                    {h} Hours
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <Clock className="text-orange-400 shrink-0 mt-0.5" size={14} />
                        <p className="text-[10px] text-orange-200/60 leading-relaxed italic">
                            Granting access will allow the requester to view your full medical history, including lab results, prescriptions, and clinical notes for the duration specified.
                        </p>
                    </div>
                </div>

                <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-start">
                    <Button
                        variant="ghost"
                        onClick={handleDeny}
                        className="text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                    >
                        <X className="mr-2 h-4 w-4" /> Deny Request
                    </Button>
                    <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                        onClick={handleApprove}
                        disabled={isGranting}
                    >
                        {isGranting ? (
                            <Activity className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="mr-2 h-4 w-4" />
                        )}
                        Approve Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
