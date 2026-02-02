"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    UploadCloud,
    FileText,
    User,
    Loader2,
    CheckCircle2,
    Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { getDoctorProfile, getHospitalProfile, notifyHospitalPendingSubmission } from "@/lib/database.service";

const uploadSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    recordType: z.string().min(1, "Record Type is required"),
    recordTitle: z.string().min(3, "Record Title is required"),
    notes: z.string().optional(),
});

export function DoctorRecordUploadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { supabaseSession } = useAppStore();

    const form = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            patientId: "",
            recordType: "",
            recordTitle: "",
            notes: "",
        },
    });

    async function onSubmit(values: z.infer<typeof uploadSchema>) {
        try {
            setIsSubmitting(true);
            const userId = supabaseSession?.user?.id;

            if (!userId) {
                toast.error("You must be logged in to submit records");
                return;
            }

            // 1. Get doctor profile to get the internal ID
            const doctorProfile = await getDoctorProfile(userId);
            if (!doctorProfile || !doctorProfile.primary_hospital_id) {
                toast.error("Doctor profile or associated hospital not found");
                return;
            }

            // 2. Map record type to the allowed enum in DB
            const recordTypeMap: Record<string, string> = {
                'lab_result': 'Lab Result',
                'prescription': 'Prescription',
                'imaging': 'Imaging',
                'clinical_note': 'Clinical Note'
            };

            const mappedType = recordTypeMap[values.recordType] || 'Clinical Note';

            // 3. Create submission
            const { data, error } = await supabase
                .from('medical_record_submissions')
                .insert([{
                    doctor_id: doctorProfile.id,
                    patient_id: values.patientId, // In real app, this should be validated as a real patient UUID
                    hospital_id: doctorProfile.primary_hospital_id,
                    record_type: mappedType,
                    record_title: values.recordTitle,
                    record_description: values.notes,
                    overall_status: 'pending_hospital_review',
                    is_draft: false
                }])
                .select()
                .single();

            if (error) {
                console.error("Submission error:", error);
                toast.error("Failed to submit record", {
                    description: error.message
                });
                return;
            }

            // 4. Trigger Notification to Hospital Admin
            try {
                // Fetch hospital profile to get admin user_id
                const hospital = await getHospitalProfile(doctorProfile.primary_hospital_id);

                // Fetch patient name for better notification
                const { data: patientUser } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', values.patientId)
                    .single();

                if (hospital?.user_id) {
                    await notifyHospitalPendingSubmission(
                        hospital.user_id,
                        values.recordTitle,
                        `Dr. ${doctorProfile.last_name}`,
                        patientUser?.full_name || 'Anonymous Patient'
                    );
                }
            } catch (notifyError) {
                console.error("Notification warning:", notifyError);
                // Don't fail the whole submission just because notification failed
            }

            toast.success("Record Submitted for Review", {
                description: `ID: ${data.submission_code}. Hospital admin has been notified.`,
            });

            form.reset();
            // Trigger a page refresh or emit event to reload submissions list
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Critical error in submission:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-8 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <UploadCloud className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Generate Clinical Record</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Encrypted on-chain submission</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-500 text-[9px] uppercase tracking-[0.2em] font-black">Target Patient UUID</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                            <Input placeholder="Search Patient..." {...field} className="bg-white/5 border-white/10 pl-10 h-11 focus:border-emerald-500 transition-all font-mono text-xs" />
                                            <div className="absolute right-3 top-3">
                                                <Search className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="recordType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-500 text-[9px] uppercase tracking-[0.2em] font-black">Classification</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 h-11 focus:border-emerald-500 uppercase text-[10px] font-bold tracking-widest">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#0A0A0A] border-white/10 text-gray-300">
                                            <SelectItem value="lab_result" className="focus:bg-white/5">Lab Result</SelectItem>
                                            <SelectItem value="prescription" className="focus:bg-white/5">Prescription</SelectItem>
                                            <SelectItem value="imaging" className="focus:bg-white/5">Imaging (X-Ray/MRI)</SelectItem>
                                            <SelectItem value="clinical_note" className="focus:bg-white/5">Clinical Note</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="recordTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-500 text-[9px] uppercase tracking-[0.2em] font-black">Entry Title</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input placeholder="e.g. Annual Blood Work - Panel Q3" {...field} className="bg-white/5 border-white/10 pl-10 h-11 focus:border-emerald-500 transition-all" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-500 text-[9px] uppercase tracking-[0.2em] font-black">Professional Observations</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Detailed clinical findings..."
                                        {...field}
                                        className="bg-white/5 border-white/10 min-h-[120px] focus:border-emerald-500 transition-all resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] shadow-xl"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                Encrypting & Transmitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-3 h-4 w-4" />
                                Broadcast to Hospital Protocol
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
