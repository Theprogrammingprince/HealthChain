"use client";

import { useState, useEffect } from "react";
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
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    emergencyContact: string;
}

export function ProfileDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial State
    const [profile, setProfile] = useState<UserProfile>({
        firstName: "",
        lastName: "",
        email: "",
        emergencyContact: ""
    });

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("healthchain_user_profile");
        if (saved) {
            try {
                setProfile(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load profile", e);
            }
        }
    }, []);

    const handleChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        localStorage.setItem("healthchain_user_profile", JSON.stringify(profile));

        toast.success("Profile Updated", {
            description: "Your personal information has been saved locally."
        });

        setIsLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-white">
                    <User className="mr-2 h-4 w-4" /> Update Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your personal details. This information is stored locally for convenience.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={profile.firstName}
                                    onChange={(e) => handleChange("firstName", e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={profile.lastName}
                                    onChange={(e) => handleChange("lastName", e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="emergency">Emergency Contact</Label>
                            <Input
                                id="emergency"
                                placeholder="+1 (555) ..."
                                value={profile.emergencyContact}
                                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
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
