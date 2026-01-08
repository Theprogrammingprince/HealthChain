"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Building2, Wallet } from "lucide-react";

interface GrantAccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GrantAccessDialog({ isOpen, onClose }: GrantAccessDialogProps) {
    const { grantAccess } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        entityName: "",
        entityAddress: "",
        level: "Full" as "Full" | "Emergency Only",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.entityName || !formData.entityAddress) {
            return toast.error("Please fill in all fields");
        }

        setIsLoading(true);
        try {
            await grantAccess({
                id: Math.random().toString(36).substring(2, 11),
                entityName: formData.entityName,
                entityAddress: formData.entityAddress,
                grantedDate: new Date().toISOString().split('T')[0],
                level: formData.level,
            });

            toast.success("Access Granted Successfully", {
                description: `${formData.entityName} can now authorized to access your vault.`,
            });

            onClose();
            setFormData({ entityName: "", entityAddress: "", level: "Full" });
        } catch (error: any) {
            console.error("Grant access failed:", error);
            toast.error("Process Failed", {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px] bg-[#0A0A0A]/95 border-white/10 backdrop-blur-2xl text-white rounded-3xl p-8">
                <DialogHeader className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Grant Clinical Access</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Authorize a medical institution or doctor to decrypt and view your specific medical records.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="entityName" className="text-xs font-bold uppercase tracking-widest text-gray-500">Institution Name</Label>
                            <div className="relative">
                                <Input
                                    id="entityName"
                                    placeholder="e.g. Mayo Clinic Rochester"
                                    required
                                    className="bg-white/5 border-white/10 rounded-xl h-11 pl-10 focus:ring-primary/20"
                                    value={formData.entityName}
                                    onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                                />
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="entityAddress" className="text-xs font-bold uppercase tracking-widest text-gray-500">Wallet Address (ENS or 0x...)</Label>
                            <div className="relative">
                                <Input
                                    id="entityAddress"
                                    placeholder="0x71C...345a"
                                    required
                                    className="bg-white/5 border-white/10 rounded-xl h-11 pl-10 font-mono text-xs"
                                    value={formData.entityAddress}
                                    onChange={(e) => setFormData({ ...formData, entityAddress: e.target.value })}
                                />
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Access Level</Label>
                            <Select defaultValue="Full" onValueChange={(val: any) => setFormData({ ...formData, level: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/10">
                                    <SelectItem value="Full">Full Access (View & History)</SelectItem>
                                    <SelectItem value="Emergency Only">Emergency (Restricted)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    PROCESSING ON-CHAIN...
                                </>
                            ) : (
                                "GRANT SECURE ACCESS"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
