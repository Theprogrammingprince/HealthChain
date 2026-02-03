"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldX,
    ShieldCheck,
    UserPlus,
    ExternalLink,
    ChevronRight,
    ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { GrantAccessDialog } from "./GrantAccessDialog";
import { getActivePatientPermissions, revokeAccessPermission } from "@/lib/database.service";
import { PatientAccessPermission } from "@/lib/database.types";
import { useEffect } from "react";
import { Clock } from "lucide-react";

export function AccessControlList() {
    const { accessPermissions, revokeAccess, supabaseUser } = useAppStore();
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
    const [tempPermissions, setTempPermissions] = useState<PatientAccessPermission[]>([]);
    const [isRevokingTemp, setIsRevokingTemp] = useState(false);

    const fetchTempPermissions = async () => {
        if (supabaseUser) {
            try {
                const data = await getActivePatientPermissions(supabaseUser.id);
                setTempPermissions(data);
            } catch (error) {
                console.error("Failed to fetch temp permissions:", error);
            }
        }
    };

    useEffect(() => {
        fetchTempPermissions();
        // Refresh every minute
        const interval = setInterval(fetchTempPermissions, 60000);
        return () => clearInterval(interval);
    }, [supabaseUser]);

    const handleRevoke = async () => {
        if (revokingId) {
            // Check if it's a temp permission
            const tempPerm = tempPermissions.find(p => p.id === revokingId);
            if (tempPerm) {
                setIsRevokingTemp(true);
                try {
                    if (!supabaseUser) throw new Error("User not authenticated");
                    await revokeAccessPermission(revokingId, supabaseUser.id);
                    toast.error("Temporary Access Revoked", {
                        description: "The clinical entity's temporary access has been terminated.",
                        icon: <ShieldAlert className="text-red-500" />
                    });
                    fetchTempPermissions();
                } catch (error) {
                    toast.error("Revocation Failed");
                } finally {
                    setIsRevokingTemp(false);
                }
            } else {
                revokeAccess(revokingId);
                toast.error("Access Revoked", {
                    description: "The entity can no longer decrypt your clinical data.",
                    icon: <ShieldAlert className="text-red-500" />
                });
            }
            setRevokingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500 w-5 h-5" />
                        Active Permissions
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 lowercase tracking-wide">
                        MANAGE WHICH HOSPITALS & DOCTORS CAN DECRYPT YOUR RECORDS
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 text-gray-400"
                    onClick={() => setIsGrantDialogOpen(true)}
                >
                    <UserPlus className="mr-2 h-4 w-4" /> Grant New Access
                </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow>
                            <TableHead>Entity Name</TableHead>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead>Granted Date</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {accessPermissions.map((permission) => (
                                <motion.tr
                                    key={permission.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                                >
                                    <TableCell className="font-semibold text-white">
                                        {permission.entityName}
                                    </TableCell>
                                    <TableCell className="text-gray-500 font-mono text-[10px]">
                                        {permission.entityAddress}
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-xs uppercase tracking-tighter">
                                        {permission.grantedDate}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                        text-[10px] h-5 rounded-full px-2
                        ${permission.level === 'Full'
                                                    ? 'border-[#00BFFF]/20 text-[#00BFFF] bg-[#00BFFF]/5'
                                                    : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'}
                      `}
                                        >
                                            {permission.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-white">
                                                <ExternalLink size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-600 hover:text-red-500 hover:bg-red-500/10"
                                                onClick={() => setRevokingId(permission.id)}
                                            >
                                                <ShieldX size={14} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>

                        {accessPermissions.length === 0 && tempPermissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500 italic">
                                    No one has access yet – your data is private.
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Temporary Permissions */}
                        <AnimatePresence mode="popLayout">
                            {tempPermissions.map((permission: PatientAccessPermission) => (
                                <motion.tr
                                    key={permission.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group hover:bg-emerald-500/5 transition-colors border-b border-white/5 last:border-0"
                                >
                                    <TableCell className="font-semibold text-emerald-400">
                                        Clinical Provider (Via Request)
                                    </TableCell>
                                    <TableCell className="text-gray-500 font-mono text-[10px]">
                                        {permission.accessor_id.slice(0, 16)}...
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-xs uppercase tracking-tighter">
                                        Ends: {new Date(permission.expires_at).toLocaleTimeString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] h-5 rounded-full px-2 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 flex items-center gap-1 w-fit"
                                        >
                                            <Clock size={8} /> {permission.scope === 'full' ? 'FULL' : 'PARTIAL'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-600 hover:text-red-500 hover:bg-red-500/10"
                                            onClick={() => setRevokingId(permission.id)}
                                        >
                                            <ShieldX size={14} />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <ShieldCheck size={18} />
                </div>
                <div>
                    <p className="text-xs text-indigo-100 font-bold uppercase tracking-wider">Blockchain Verified Permissions</p>
                    <p className="text-[10px] text-indigo-500/60 leading-relaxed italic mt-0.5">
                        HealthChain uses smart contracts to enforce access. Revoking internally also revokes the cryptographic key handle.
                    </p>
                </div>
            </div>

            {/* Revocation Confirmation Dialog */}
            <Dialog open={!!revokingId} onOpenChange={(open) => !open && setRevokingId(null)}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-red-500 font-bold">
                            <ShieldAlert /> Confirm Revocation
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 pt-2 leading-relaxed">
                            Are you sure you want to revoke access? This entity will immediately lose the ability to decrypt your medical records.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="grid grid-cols-2 gap-3 pt-6 sm:justify-start">
                        <Button variant="ghost" onClick={() => setRevokingId(null)} className="text-gray-400 hover:text-white hover:bg-white/5 border border-white/5">
                            Keep Access
                        </Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white font-bold" onClick={handleRevoke}>
                            Revoke Access
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <GrantAccessDialog
                isOpen={isGrantDialogOpen}
                onClose={() => setIsGrantDialogOpen(false)}
            />
        </div>
    );
}
