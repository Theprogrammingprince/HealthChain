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
    UserPlus,
    ShieldX,
    ShieldCheck,
    Search,
    MoreVertical,
    Plus,
    ShieldAlert,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, StaffRole } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function StaffManagementTable() {
    const { staffMembers, addStaff, revokeStaff } = useAppStore();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', role: 'Doctor' as StaffRole, wallet: '' });

    const handleAddStaff = () => {
        if (!newStaff.name || !newStaff.wallet) return;

        addStaff({
            id: 's' + Math.random().toString(36).substring(2, 7),
            name: newStaff.name,
            role: newStaff.role,
            walletAddress: newStaff.wallet,
            status: 'Active'
        });

        toast.success("Staff Member Authorized", {
            description: `${newStaff.name} has been granted ${newStaff.role} permissions on the hospital smart contract.`
        });

        setIsAddOpen(false);
        setNewStaff({ name: '', role: 'Doctor', wallet: '' });
    };

    const handleRevoke = (id: string, name: string) => {
        revokeStaff(id);
        toast.error("Credentials Revoked", {
            description: `${name}'s access key has been invalidated on the protocol level.`,
            icon: <ShieldAlert className="text-red-500" />
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Staff Credential Registry</h3>
                        <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">RBAC Permissions Management</p>
                    </div>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold h-11 px-6 rounded-xl">
                            <Plus className="mr-2 h-4 w-4" /> Authorize New Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Authorize Staff Member</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Register a new medical professional on the hospital&apos;s on-chain permission list.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                                <Input
                                    placeholder="e.g. Dr. Allison Cameron"
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Clinical Role</label>
                                <Select value={newStaff.role} onValueChange={(v: StaffRole) => setNewStaff({ ...newStaff, role: v })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="Doctor">Doctor (Full Write Access)</SelectItem>
                                        <SelectItem value="Nurse">Nurse (Vitals & Read-only)</SelectItem>
                                        <SelectItem value="Admin">Clinical Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Wallet Address</label>
                                <Input
                                    placeholder="0x..."
                                    value={newStaff.wallet}
                                    onChange={e => setNewStaff({ ...newStaff, wallet: e.target.value })}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl font-mono text-xs"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="w-full h-12 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold rounded-xl" onClick={handleAddStaff}>
                                Emit Permission Key
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                            <TableHead className="pl-6">Name & Credential</TableHead>
                            <TableHead>Protocol Role</TableHead>
                            <TableHead>Wallet Signature Base</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-6">Manage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {staffMembers.map((staff) => (
                                <motion.tr
                                    key={staff.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group hover:bg-white/5 transition-colors border-white/5"
                                >
                                    <TableCell className="pl-6 py-4">
                                        <p className="font-bold text-white">{staff.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase mt-0.5">{staff.id}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                      bg-white/5 font-bold text-[10px] rounded-full px-3 py-1
                      ${staff.role === 'Doctor' ? 'text-[#00BFFF] border-[#00BFFF]/20' : 'text-gray-400 border-white/10'}
                    `}>
                                            {staff.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px] text-gray-500">
                                        {staff.walletAddress}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${staff.status === 'Active' ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                                                {staff.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:text-white rounded-lg">
                                                <MoreVertical size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRevoke(staff.id, staff.name)}
                                                className="h-9 w-9 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <ShieldX size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#00BFFF]/5 border border-[#00BFFF]/10">
                <ShieldCheck className="text-[#00BFFF] w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Audit Transparency Notice</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                        All staff role modifications are signed by the Hospital Multi-Sig and stored permanently on the Polygon Ledger. Unauthorized credentialing is prevented by protocol-level cryptographic verification.
                    </p>
                </div>
            </div>
        </div>
    );
}
