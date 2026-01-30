"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Stethoscope,
    ShieldCheck,
    Briefcase,
    ArrowRight,
    History,
    AlertCircle,
    X,
    Clock,
    CheckCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const doctorSettingsSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phoneNumber: z.string().optional(),
    specialty: z.string().min(2, "Specialty is required"),
    subSpecialty: z.string().optional(),
    yearsOfExperience: z.coerce.number().min(0).optional(),
    hospitalName: z.string().optional(),
    hospitalDepartment: z.string().optional(),
});

type DoctorSettingsFormData = z.infer<typeof doctorSettingsSchema>;

interface DoctorProfile {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    medical_license_number: string;
    specialty: string;
    sub_specialty?: string;
    years_of_experience?: number;
    verification_status: "pending" | "verified" | "rejected" | "suspended";
    hospital_name?: string;
    hospital_department?: string;
}

export default function DoctorSettingsPage() {
    const router = useRouter();
    const { supabaseSession, walletAddress } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<any | null>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [transferTargetId, setTransferTargetId] = useState("");
    const [transferReason, setTransferReason] = useState("");
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
    const [transferRequests, setTransferRequests] = useState<any[]>([]);
    const [isRequestsLoading, setIsRequestsLoading] = useState(false);

    const form = useForm<DoctorSettingsFormData>({
        resolver: zodResolver(doctorSettingsSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            specialty: "",
            subSpecialty: "",
            yearsOfExperience: 0,
            hospitalName: "",
            hospitalDepartment: "",
        },
    });

    useEffect(() => {
        loadDoctorProfile();
        fetchHospitals();
    }, [supabaseSession, walletAddress]);

    const fetchHospitals = async () => {
        try {
            const res = await fetch('/api/hospitals');
            const json = await res.json();
            if (json.success) {
                setHospitals(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch hospitals:", err);
        }
    };

    const fetchTransferRequests = async (doctorId: string) => {
        try {
            setIsRequestsLoading(true);
            const res = await fetch(`/api/doctor/transfer-request?doctorId=${doctorId}`);
            const json = await res.json();
            if (json.success) {
                setTransferRequests(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch transfer requests:", err);
        } finally {
            setIsRequestsLoading(false);
        }
    };

    const loadDoctorProfile = async () => {
        try {
            setIsLoading(true);
            const userId = supabaseSession?.user?.id;

            if (!userId) {
                router.push("/auth");
                return;
            }

            const { data, error } = await supabase
                .from("doctor_profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error loading doctor profile:", error);
                toast.error("Failed to load doctor profile");
                return;
            }

            if (data) {
                setDoctorProfile(data);
                fetchTransferRequests(data.id);
                form.reset({
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    phoneNumber: data.phone || "",
                    specialty: data.specialty || "",
                    subSpecialty: data.sub_specialty || "",
                    yearsOfExperience: data.years_of_experience || 0,
                    hospitalName: data.hospital_name || "",
                    hospitalDepartment: data.hospital_department || "",
                });
            }
        } catch (error) {
            console.error("Error in loadDoctorProfile:", error);
            toast.error("An error occurred while loading your profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestTransfer = async () => {
        if (!transferTargetId) {
            toast.error("Please select a target hospital");
            return;
        }

        try {
            setIsSubmittingTransfer(true);
            const res = await fetch('/api/doctor/transfer-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctorProfile.id,
                    fromHospitalId: doctorProfile.primary_hospital_id,
                    toHospitalId: transferTargetId,
                    reason: transferReason
                })
            });

            const json = await res.json();
            if (res.ok) {
                toast.success("Transfer request submitted successfully");
                setIsTransferDialogOpen(false);
                setTransferReason("");
                setTransferTargetId("");
                fetchTransferRequests(doctorProfile.id);
            } else {
                toast.error(json.error || "Failed to submit request");
            }
        } catch (err) {
            console.error("Error requesting transfer:", err);
            toast.error("An error occurred");
        } finally {
            setIsSubmittingTransfer(false);
        }
    };

    const handleCancelTransfer = async (requestId: string) => {
        try {
            const res = await fetch('/api/doctor/transfer-request', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    action: 'cancel'
                })
            });

            if (res.ok) {
                toast.success("Request cancelled");
                fetchTransferRequests(doctorProfile.id);
            } else {
                const json = await res.json();
                toast.error(json.error || "Failed to cancel request");
            }
        } catch (err) {
            console.error("Error cancelling transfer:", err);
            toast.error("An error occurred");
        }
    };

    const onSubmit = async (data: DoctorSettingsFormData) => {
        try {
            setIsSaving(true);
            const userId = supabaseSession?.user?.id;

            if (!userId) {
                toast.error("You must be logged in to save settings");
                return;
            }

            const { error } = await supabase
                .from("doctor_profiles")
                .update({
                    first_name: data.firstName,
                    last_name: data.lastName,
                    phone: data.phoneNumber || null,
                    specialty: data.specialty,
                    sub_specialty: data.subSpecialty || null,
                    years_of_experience: data.yearsOfExperience,
                    hospital_department: data.hospitalDepartment || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);

            if (error) {
                console.error("Error updating doctor profile:", error);
                toast.error("Failed to save settings");
                return;
            }

            toast.success("Settings saved successfully!");
            loadDoctorProfile();
        } catch (error) {
            console.error("Error in onSubmit:", error);
            toast.error("An error occurred while saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64 bg-white/5" />
                    <Skeleton className="h-[600px] w-full bg-white/5" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/doctor/dashboard")}
                            className="hover:bg-white/5 text-gray-400"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-tight">Professional Settings</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Manage your clinical profile</p>
                        </div>
                    </div>

                    {doctorProfile && (
                        <Badge className={`${doctorProfile.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                            doctorProfile.verification_status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-red-500/10 text-red-500'
                            } border-none text-[10px] uppercase font-black px-3 py-1`}>
                            {doctorProfile.verification_status} Profile
                        </Badge>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Profile Completion Guidance */}
                    {doctorProfile && (doctorProfile.verification_status === 'pending' || !doctorProfile.phone || !doctorProfile.years_of_experience) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider">Profile Verification Required</h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Complete all required fields below to submit your profile for verification.
                                        The hospital administration will review your credentials.
                                    </p>
                                    <ul className="text-xs text-gray-500 mt-3 space-y-1">
                                        <li className={`flex items-center gap-2 ${doctorProfile.first_name && doctorProfile.last_name ? 'text-emerald-400' : ''}`}>
                                            {doctorProfile.first_name && doctorProfile.last_name ? '✓' : '○'} Full name
                                        </li>
                                        <li className={`flex items-center gap-2 ${doctorProfile.phone ? 'text-emerald-400' : ''}`}>
                                            {doctorProfile.phone ? '✓' : '○'} Contact number
                                        </li>
                                        <li className={`flex items-center gap-2 ${doctorProfile.specialty ? 'text-emerald-400' : ''}`}>
                                            {doctorProfile.specialty ? '✓' : '○'} Primary specialty
                                        </li>
                                        <li className={`flex items-center gap-2 ${doctorProfile.years_of_experience ? 'text-emerald-400' : ''}`}>
                                            {doctorProfile.years_of_experience ? '✓' : '○'} Years of experience
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <Card className="bg-white/5 border-white/10 overflow-hidden rounded-3xl backdrop-blur-sm">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                    <Stethoscope className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Clinical Identity</CardTitle>
                                    <CardDescription className="text-gray-500 font-medium italic">
                                        Update your professional credentials and affiliation
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">First Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-white/5 border-white/10 h-12 focus:border-indigo-500 rounded-xl transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-white/5 border-white/10 h-12 focus:border-indigo-500 rounded-xl transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">License Number</Label>
                                            <div className="h-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 flex items-center text-gray-500 font-mono text-sm">
                                                <ShieldCheck className="w-4 h-4 mr-3 text-indigo-500/50" />
                                                {doctorProfile?.medical_license_number}
                                            </div>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Permanent ID - Cannot be changed</p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                            <Input
                                                                {...field}
                                                                className="bg-white/5 border-white/10 h-12 pl-12 focus:border-indigo-500 rounded-xl transition-all"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="h-px bg-white/5 my-4" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="specialty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Primary Specialty</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-white/5 border-white/10 h-12 focus:border-indigo-500 rounded-xl transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="yearsOfExperience"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Years of Experience</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            className="bg-white/5 border-white/10 h-12 focus:border-indigo-500 rounded-xl transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hospital Affiliation</Label>
                                            <div className="flex gap-2">
                                                <div className="h-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 flex items-center text-gray-500 font-medium flex-1">
                                                    <Briefcase className="w-4 h-4 mr-3 text-indigo-500/50" />
                                                    {doctorProfile?.hospital_name || "Independent/No Affiliation"}
                                                </div>

                                                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="h-12 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-6"
                                                            disabled={transferRequests.some(r => r.status === 'pending')}
                                                        >
                                                            Request Transfer
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md rounded-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Request Hospital Transfer</DialogTitle>
                                                            <DialogDescription className="text-gray-500">
                                                                Request to move your professional affiliation to a different medical facility.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="space-y-6 py-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Hospital</Label>
                                                                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                                    {hospitals.filter(h => h.id !== doctorProfile?.primary_hospital_id).map(hospital => (
                                                                        <button
                                                                            key={hospital.id}
                                                                            type="button"
                                                                            onClick={() => setTransferTargetId(hospital.id)}
                                                                            className={`w-full text-left p-4 rounded-xl border transition-all ${transferTargetId === hospital.id
                                                                                ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                                                                                }`}
                                                                        >
                                                                            <span className="font-bold">{hospital.hospital_name}</span>
                                                                        </button>
                                                                    ))}
                                                                    {hospitals.length <= 1 && (
                                                                        <p className="text-xs text-gray-500 italic text-center py-4">No other hospitals available for transfer.</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reason for Request (Optional)</Label>
                                                                <Textarea
                                                                    placeholder="Briefly explain why you want to transfer..."
                                                                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:border-indigo-500"
                                                                    value={transferReason}
                                                                    onChange={(e) => setTransferReason(e.target.value)}
                                                                />
                                                            </div>

                                                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                                                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                                <p className="text-[10px] text-amber-500/80 leading-relaxed">
                                                                    Changing your hospital affiliation will trigger a full re-verification of your credentials by the new facility's administration.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <DialogFooter className="gap-3">
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setIsTransferDialogOpen(false)}
                                                                className="rounded-xl"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={handleRequestTransfer}
                                                                disabled={!transferTargetId || isSubmittingTransfer}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
                                                            >
                                                                {isSubmittingTransfer ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                                                                Submit Request
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            {transferRequests.some(r => r.status === 'pending') && (
                                                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-1">
                                                    You have a pending transfer request under review.
                                                </p>
                                            )}
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="hospitalDepartment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Department</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-white/5 border-white/10 h-12 focus:border-indigo-500 rounded-xl transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Update Profile
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Transfer History */}
                    {transferRequests.length > 0 && (
                        <Card className="bg-white/5 border-white/10 overflow-hidden rounded-3xl backdrop-blur-sm">
                            <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                            <History className="w-7 h-7 text-amber-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Transfer History</CardTitle>
                                            <CardDescription className="text-gray-500 font-medium italic">
                                                Track your hospital affiliation requests
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {transferRequests.map((req) => (
                                        <div key={req.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className={`p-2 rounded-full ${req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' :
                                                        req.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                                            req.status === 'cancelled' ? 'bg-gray-500/20 text-gray-500' :
                                                                'bg-amber-500/20 text-amber-500'
                                                        }`}>
                                                        {req.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                                                            req.status === 'rejected' ? <X className="w-5 h-5" /> :
                                                                req.status === 'cancelled' ? <X className="w-5 h-5" /> :
                                                                    <Clock className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-gray-400">{req.from_hospital?.hospital_name || 'Individual'}</span>
                                                        <ArrowRight className="w-3 h-3 text-gray-600" />
                                                        <span className="text-sm font-black text-white uppercase tracking-tight">{req.to_hospital?.hospital_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                                            Requested: {new Date(req.created_at).toLocaleDateString()}
                                                        </span>
                                                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest border-none px-2 h-5 ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                                req.status === 'cancelled' ? 'bg-gray-500/10 text-gray-500' :
                                                                    'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {req.status}
                                                        </Badge>
                                                    </div>
                                                    {req.status === 'rejected' && req.rejection_reason && (
                                                        <p className="text-[10px] text-red-400 mt-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10 max-w-md">
                                                            Reason: {req.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {req.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancelTransfer(req.id)}
                                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                                                >
                                                    Cancel Request
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
