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
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Save,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import { HospitalDashboardGuard } from "@/components/dashboard/HospitalDashboardGuard";
import { VerificationStatusBanner } from "@/components/dashboard/VerificationStatusBanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const hospitalSettingsSchema = z.object({
    hospitalName: z.string().min(3, "Hospital name must be at least 3 characters"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    description: z.string().optional(),
});

type HospitalSettingsFormData = z.infer<typeof hospitalSettingsSchema>;

interface HospitalProfile {
    hospital_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    website?: string;
    description?: string;
    verification_status: "pending" | "verified" | "rejected";
    rejection_reason?: string | null;
}

export default function HospitalSettingsPage() {
    const router = useRouter();
    const { supabaseSession, walletAddress } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile | null>(null);

    const form = useForm<HospitalSettingsFormData>({
        resolver: zodResolver(hospitalSettingsSchema),
        defaultValues: {
            hospitalName: "",
            phoneNumber: "",
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            website: "",
            description: "",
        },
    });

    useEffect(() => {
        loadHospitalProfile();
    }, [supabaseSession, walletAddress]);

    const loadHospitalProfile = async () => {
        try {
            setIsLoading(true);

            const userId = supabaseSession?.user?.id || walletAddress;

            if (!userId) {
                router.push("/signin");
                return;
            }

            const { data, error } = await supabase
                .from("hospital_profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error loading hospital profile:", error);
                toast.error("Failed to load hospital profile");
                return;
            }

            if (data) {
                setHospitalProfile(data);

                // Pre-fill form with existing data
                form.setValue("hospitalName", data.hospital_name || "");
                form.setValue("phoneNumber", data.phone_number || "");
                form.setValue("address", data.address || "");
                form.setValue("city", data.city || "");
                form.setValue("state", data.state || "");
                form.setValue("country", data.country || "");
                form.setValue("postalCode", data.postal_code || "");
                form.setValue("website", data.website || "");
                form.setValue("description", data.description || "");
            }
        } catch (error) {
            console.error("Error in loadHospitalProfile:", error);
            toast.error("An error occurred while loading your profile");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: HospitalSettingsFormData) => {
        try {
            setIsSaving(true);

            const userId = supabaseSession?.user?.id || walletAddress;

            if (!userId) {
                toast.error("You must be logged in to save settings");
                return;
            }

            const { error } = await supabase
                .from("hospital_profiles")
                .update({
                    hospital_name: data.hospitalName,
                    phone_number: data.phoneNumber || null,
                    address: data.address || null,
                    city: data.city || null,
                    state: data.state || null,
                    country: data.country || null,
                    postal_code: data.postalCode || null,
                    website: data.website || null,
                    description: data.description || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);

            if (error) {
                console.error("Error updating hospital profile:", error);
                toast.error("Failed to save settings");
                return;
            }

            toast.success("Settings saved successfully!");
            loadHospitalProfile(); // Reload to get updated data
        } catch (error) {
            console.error("Error in onSubmit:", error);
            toast.error("An error occurred while saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <HospitalDashboardGuard allowedForUnverified={true}>
                <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64 bg-[#222222]" />
                        <Skeleton className="h-96 w-full bg-[#222222]" />
                    </div>
                </div>
            </HospitalDashboardGuard>
        );
    }

    return (
        <HospitalDashboardGuard allowedForUnverified={true}>
            <div className="min-h-screen bg-[#0A0A0A] text-white">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/clinical")}
                                className="hover:bg-white/5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold">Hospital Settings</h1>
                                <p className="text-xs text-gray-500">Manage your hospital profile</p>
                            </div>
                        </div>

                        {hospitalProfile && (
                            <VerificationStatusBanner
                                status={hospitalProfile.verification_status}
                                rejectionReason={hospitalProfile.rejection_reason}
                            />
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-6 py-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-[#111111] border-[#222222]">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#00BFFF]/10 rounded-xl flex items-center justify-center border border-[#00BFFF]/20">
                                        <Building2 className="w-6 h-6 text-[#00BFFF]" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl text-white">Profile Information</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Update your hospital's contact and location details
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        {/* Hospital Name */}
                                        <FormField
                                            control={form.control}
                                            name="hospitalName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Hospital Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="e.g., Lagos General Hospital"
                                                            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Contact Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-300 flex items-center gap-2">
                                                            <Phone className="w-4 h-4" />
                                                            Phone Number
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="+234 xxx xxx xxxx"
                                                                className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="website"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-300 flex items-center gap-2">
                                                            <Globe className="w-4 h-4" />
                                                            Website
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="https://example.com"
                                                                className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Address */}
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        Street Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="123 Main Street"
                                                            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Location Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-300">City</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Lagos"
                                                                className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-300">State</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Lagos State"
                                                                className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="postalCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-300">Postal Code</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="100001"
                                                                className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Country</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Nigeria"
                                                            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description */}
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Brief description of your hospital and services..."
                                                            rows={4}
                                                            className="bg-[#1A1A1A] border-[#333333] text-white placeholder:text-gray-500 focus:border-[#00BFFF] resize-none"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Submit Button */}
                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full md:w-auto bg-gradient-to-r from-[#00BFFF] to-[#0080FF] hover:shadow-lg hover:shadow-[#00BFFF]/50 text-black font-semibold h-12 px-8"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
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
        </HospitalDashboardGuard>
    );
}
