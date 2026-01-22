"use client";

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, Heart, Activity, User, Scale, Ruler, Star, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSetupDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileSetupDialog({ isOpen, onClose }: ProfileSetupDialogProps) {
    const { supabaseUser, fetchUserProfile, userVitals } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: userVitals.fullName || "",
        dob: userVitals.dob || "",
        genotype: userVitals.genotype !== "N/A" ? userVitals.genotype : "",
        blood_group: userVitals.bloodType !== "N/A" ? userVitals.bloodType : "",
        weight: userVitals.weight ? userVitals.weight.toString() : "",
        height: userVitals.height ? userVitals.height.toString() : "",
        blood_pressure: userVitals.bloodPressure !== "N/A" ? userVitals.bloodPressure : "",
        glucose: userVitals.glucose !== "N/A" ? userVitals.glucose : "",
        allergies: userVitals.allergies.join(", "),
        medications: userVitals.medications.join(", "),
        chronic_conditions: userVitals.conditions.join(", "),
    });

    // Sync form data when userVitals changes (e.g., after initial fetch)
    useEffect(() => {
        if (isOpen) {
            setFormData({
                full_name: userVitals.fullName || "",
                dob: userVitals.dob || "",
                genotype: userVitals.genotype !== "N/A" ? userVitals.genotype : "",
                blood_group: userVitals.bloodType !== "N/A" ? userVitals.bloodType : "",
                weight: userVitals.weight ? userVitals.weight.toString() : "",
                height: userVitals.height ? userVitals.height.toString() : "",
                blood_pressure: userVitals.bloodPressure !== "N/A" ? userVitals.bloodPressure : "",
                glucose: userVitals.glucose !== "N/A" ? userVitals.glucose : "",
                allergies: userVitals.allergies.join(", "),
                medications: userVitals.medications.join(", "),
                chronic_conditions: userVitals.conditions.join(", "),
            });
        }
    }, [isOpen, userVitals]);

    const totalSteps = 3;

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const parseNumericValue = (val: string) => {
        if (!val || val.trim() === "") return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabaseUser) return;

        setIsLoading(true);

        try {
            // 1. First check if user exists in public.users table
            const { data: existingUser, error: checkError } = await supabase
                .from("users")
                .select("id")
                .eq("id", supabaseUser.id)
                .single();

            if (checkError && checkError.code === 'PGRST116') {
                // User doesn't exist in users table, create them first
                console.log("User not found in users table, creating...");
                const { error: insertError } = await supabase
                    .from("users")
                    .insert({
                        id: supabaseUser.id,
                        email: supabaseUser.email,
                        full_name: formData.full_name,
                        dob: formData.dob || null,
                        role: 'patient',
                        auth_provider: 'email',
                    });

                if (insertError) {
                    console.error("Error inserting user:", insertError);
                    throw insertError;
                }
                console.log("User created successfully");
            } else if (existingUser) {
                // User exists, update their info
                console.log("User exists, updating...");
                const { error: userError } = await supabase
                    .from("users")
                    .update({
                        full_name: formData.full_name,
                        dob: formData.dob,
                    })
                    .eq("id", supabaseUser.id);

                if (userError) {
                    console.error("Error updating users table:", userError);
                    throw userError;
                }
            }

            // 2. Upsert detailed medical data to patient_profiles table
            const patientPayload = {
                user_id: supabaseUser.id,
                date_of_birth: formData.dob || null,
                blood_type: formData.blood_group || null,
                gender: null,
                phone_number: null,
                emergency_contact: null,
                emergency_phone: null,
                address: null,
                city: null,
                state: null,
                country: null,
                postal_code: null,
                medical_conditions: formData.chronic_conditions.split(",").map(i => i.trim()).filter(i => i !== ""),
                allergies: formData.allergies.split(",").map(i => i.trim()).filter(i => i !== ""),
                medications: formData.medications.split(",").map(i => i.trim()).filter(i => i !== ""),
            };

            console.log("Upserting patient_profiles with:", patientPayload);
            const { error: profileError } = await supabase
                .from("patient_profiles")
                .upsert(patientPayload, { onConflict: 'user_id' });

            if (profileError) {
                console.error("Error upserting patient_profiles:", profileError);
                throw profileError;
            }

            console.log("Profile setup successful!");
            toast.success("Profile Updated!", {
                description: "Your medical record has been securely initialized.",
            });

            await fetchUserProfile(); // Refresh store
            onClose();
        } catch (error: any) {
            console.error("Profile update caught error:", error);
            const errorMessage = error?.message || (typeof error === 'string' ? error : "Database connection failed");
            const errorDetails = error?.details || "No additional details provided by server.";

            toast.error("Update Failed", {
                description: `${errorMessage}. ${errorDetails}`,
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

                <div className="flex items-center justify-between mb-8 px-1">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                currentStep === step
                                    ? "bg-primary text-black ring-4 ring-primary/20"
                                    : currentStep > step
                                        ? "bg-primary/40 text-white"
                                        : "bg-white/5 text-gray-500 border border-white/10"
                            )}>
                                {currentStep > step ? <Check className="w-4 h-4" /> : step}
                            </div>
                            {step < 3 && (
                                <div className={cn(
                                    "w-12 h-[2px] mx-2 rounded-full transition-all duration-500",
                                    currentStep > step ? "bg-primary/40" : "bg-white/5"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Personal Identity</Label>
                                    <div className="space-y-4">
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Physical Metrics</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Genotype</Label>
                                            <Select
                                                value={formData.genotype}
                                                onValueChange={(val) => setFormData({ ...formData, genotype: val })}
                                            >
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
                                            <Select
                                                value={formData.blood_group}
                                                onValueChange={(val) => setFormData({ ...formData, blood_group: val })}
                                            >
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
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Clinical Baseline</Label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="blood_pressure" className="text-xs font-bold uppercase tracking-widest text-gray-500">Blood Pressure</Label>
                                            <Input
                                                id="blood_pressure"
                                                placeholder="120/80"
                                                className="bg-white/5 border-white/10 rounded-xl h-11"
                                                value={formData.blood_pressure}
                                                onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="glucose" className="text-xs font-bold uppercase tracking-widest text-gray-500">Glucose Level</Label>
                                            <Input
                                                id="glucose"
                                                placeholder="90 mg/dL"
                                                className="bg-white/5 border-white/10 rounded-xl h-11"
                                                value={formData.glucose}
                                                onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="allergies" className="text-xs font-bold uppercase tracking-widest text-gray-500">Allergies</Label>
                                        <Input
                                            id="allergies"
                                            placeholder="Penicillin, Peanuts, Pollen"
                                            className="bg-white/5 border-white/10 rounded-xl h-11"
                                            value={formData.allergies}
                                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="medications" className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Medications</Label>
                                        <Input
                                            id="medications"
                                            placeholder="Aspirin, Insulin"
                                            className="bg-white/5 border-white/10 rounded-xl h-11"
                                            value={formData.medications}
                                            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="chronic_conditions" className="text-xs font-bold uppercase tracking-widest text-gray-500">Chronic Conditions</Label>
                                        <Input
                                            id="chronic_conditions"
                                            placeholder="Asthma, Diabetes"
                                            className="bg-white/5 border-white/10 rounded-xl h-11"
                                            value={formData.chronic_conditions}
                                            onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" id="submit-profile-form" className="hidden" />
                    </form>
                </ScrollArea>

                <DialogFooter className="pt-8 flex flex-row gap-3 sm:justify-between items-center">
                    <div className="flex gap-3 w-full">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                className="flex-1 h-12 bg-transparent border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                BACK
                            </Button>
                        )}

                        {currentStep < totalSteps ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                NEXT STEP
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={isLoading}
                                onClick={() => document.getElementById('submit-profile-form')?.click()}
                                className="flex-1 h-12 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        SECURELY SYNCING...
                                    </>
                                ) : (
                                    "INITIALIZE PROFILE"
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
