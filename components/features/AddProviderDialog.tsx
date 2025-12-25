"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useHealthRecords } from "@/components/hooks/useHealthRecords";
import { toast } from "sonner";
import { isAddress } from "viem";

interface AddProviderDialogProps {
    onProviderAdded: (provider: { name: string; address: string; access: string; status: string }) => void;
}

export function AddProviderDialog({ onProviderAdded }: AddProviderDialogProps) {
    const { grantAccess } = useHealthRecords();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [access, setAccess] = useState("Read");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !address) {
            toast.error("Please fill in all fields");
            return;
        }

        if (!isAddress(address)) {
            toast.error("Invalid Ethereum Address");
            return;
        }

        setIsLoading(true);

        try {
            await grantAccess(address);

            // On success (transaction sent/confirmed)
            onProviderAdded({
                name,
                address, // Storing address might be useful for revoke later
                access,
                status: "Active"
            });

            toast.success("Access Granted", {
                description: `You have successfully granted ${access} access to ${name}.`
            });

            setOpen(false);
            setName("");
            setAddress("");
            setAccess("Read");
        } catch (error) {
            console.error(error);
            // Error toast handled by hook mostly, but safe to add here
            toast.error("Failed to grant access");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Provider</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10">
                <DialogHeader>
                    <DialogTitle>Grant Access</DialogTitle>
                    <DialogDescription>
                        Authorize a healthcare provider to view your encrypted records. This action is recorded on-chain.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Provider Name</Label>
                            <Input
                                id="name"
                                placeholder="Dr. Smith or City Hospital"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Wallet Address</Label>
                            <Input
                                id="address"
                                placeholder="0x..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="bg-white/5 border-white/10 font-mono text-xs"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="access">Access Level</Label>
                            <Select value={access} onValueChange={setAccess}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select access" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Read">Read Only</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                    <SelectItem value="Full">Full Access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming on Polygon...
                                </>
                            ) : (
                                "Grant Access"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
