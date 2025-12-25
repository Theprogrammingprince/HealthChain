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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditCriticalDataDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    field: string;
    initialValue: string;
    initialSubValue?: string;
    onSave: (value: string, subValue: string) => void;
    // For specific fields like Blood Type, we might want options
    options?: string[];
}

export function EditCriticalDataDialog({
    open,
    onOpenChange,
    title,
    description,
    initialValue,
    initialSubValue,
    onSave,
    options
}: EditCriticalDataDialogProps) {
    const [value, setValue] = useState(initialValue);
    const [subValue, setSubValue] = useState(initialSubValue || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network
        await new Promise(resolve => setTimeout(resolve, 800));

        onSave(value, subValue);

        toast.success(`${title} Updated`, {
            description: "Changes recorded locally."
        });

        setIsLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10">
                <DialogHeader>
                    <DialogTitle>Edit {title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="value">{title}</Label>
                            {options ? (
                                <Select value={value} onValueChange={setValue}>
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder={`Select ${title}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="value"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            )}
                        </div>
                        {initialSubValue !== undefined && (
                            <div className="grid gap-2">
                                <Label htmlFor="subValue">Details / Notes</Label>
                                <Input
                                    id="subValue"
                                    value={subValue}
                                    onChange={(e) => setSubValue(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                    placeholder="e.g. Dosage, Severity..."
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
