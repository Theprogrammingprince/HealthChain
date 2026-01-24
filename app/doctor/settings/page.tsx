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
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    ArrowLeft,
    Loader2,
    Stethoscope,
    ShieldCheck,
    Briefcase
} from "lucide-react";
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
    const [isSaving, setIsSaving] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);

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
    }, [supabaseSession, walletAddress]);

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
                    hospital_name: data.hospitalName || null,
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
                                        <FormField
                                            control={form.control}
                                            name="hospitalName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hospital Affiliation</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                </motion.div>
            </main>
        </div>
    );
}
