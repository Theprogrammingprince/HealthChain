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
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, Heart, Activity, User, Scale, Ruler, Star } from "lucide-react";

interface ProfileSetupDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileSetupDialog({ isOpen, onClose }: ProfileSetupDialogProps) {
    const { supabaseUser, fetchUserProfile } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        dob: "",
        genotype: "",
        blood_group: "",
        weight: "",
        height: "",
        religion: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabaseUser) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("users")
                .update({
                    full_name: formData.full_name,
                    dob: formData.dob,
                    genotype: formData.genotype,
                    blood_group: formData.blood_group,
                    weight: parseFloat(formData.weight) || null,
                    height: parseFloat(formData.height) || null,
                    religion: formData.religion,
                })
                .eq("id", supabaseUser.id);

            if (error) throw error;

            toast.success("Profile Updated!", {
                description: "Your medical record has been securely initialized.",
            });

            await fetchUserProfile(); // Refresh store
            onClose();
        } catch (error: any) {
            console.error("Profile update failed:", error);
            toast.error("Update Failed", {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-[#0A0A0A]/95 border-white/10 backdrop-blur-2xl text-white rounded-3xl p-8">
                <DialogHeader className="space-y-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                        <User className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Complete Your Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Initialize your clinical identity within the HealthChain Protocol. All data is encrypted and self-sovereign.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</Label>
                            <Input
                                id="full_name"
                                placeholder="Kenzy S."
                                required
                                className="bg-white/5 border-white/10 rounded-xl h-11 focus:ring-primary/20"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-widest text-gray-500">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    required
                                    className="bg-white/5 border-white/10 rounded-xl h-11"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="religion" className="text-xs font-bold uppercase tracking-widest text-gray-500">Religion</Label>
                                <Input
                                    id="religion"
                                    placeholder="e.g. Christianity"
                                    className="bg-white/5 border-white/10 rounded-xl h-11"
                                    value={formData.religion}
                                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Genotype</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, genotype: val })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0A0A0A] border-white/10">
                                        {["AA", "AS", "AC", "SS", "SC"].map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Blood Group</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, blood_group: val })}>
                                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0A0A0A] border-white/10">
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-xs font-bold uppercase tracking-widest text-gray-500">Weight (kg)</Label>
                                <div className="relative">
                                    <Input
                                        id="weight"
                                        type="number"
                                        placeholder="70"
                                        className="bg-white/5 border-white/10 rounded-xl h-11 pl-10"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-xs font-bold uppercase tracking-widest text-gray-500">Height (cm)</Label>
                                <div className="relative">
                                    <Input
                                        id="height"
                                        type="number"
                                        placeholder="175"
                                        className="bg-white/5 border-white/10 rounded-xl h-11 pl-10"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    />
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    SECURELY SYNCING...
                                </>
                            ) : (
                                "INITIALIZE PROTOCOL PROFILE"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
