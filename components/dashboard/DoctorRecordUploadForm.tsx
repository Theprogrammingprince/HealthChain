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

const uploadSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    recordType: z.string().min(1, "Record Type is required"),
    file: z.any().optional(), // Using any for file input for now, ideally strictly typed
    notes: z.string().optional(),
});

export function DoctorRecordUploadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            patientId: "",
            recordType: "",
            notes: "",
        },
    });

    async function onSubmit(values: z.infer<typeof uploadSchema>) {
        setIsSubmitting(true);
        // Simulate API call / blockchain interaction
        await new Promise(r => setTimeout(r, 2000));

        toast.success("Record Submitted for Review", {
            description: "Hospital admin has been notified.",
        });

        setIsSubmitting(false);
        form.reset();

        // In a real app, we would add this to a 'pending submissions' list in the store
    }

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <UploadCloud className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Upload Patient Record</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Secure IPFS Storage</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Patient ID / Wallet</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input placeholder="Enter Patient ID or Search" {...field} className="bg-white/5 border-white/10 pl-10 focus:border-emerald-500" />
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
                                <FormLabel className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Record Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:border-emerald-500">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#1A1A1A] border-white/10 text-gray-300">
                                        <SelectItem value="lab_result">Lab Result</SelectItem>
                                        <SelectItem value="prescription">Prescription</SelectItem>
                                        <SelectItem value="imaging">Imaging (X-Ray/MRI)</SelectItem>
                                        <SelectItem value="clinical_note">Clinical Note</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Placeholder for File Upload */}
                    <div className="p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-emerald-500/50 transition-colors cursor-pointer bg-white/5 flex flex-col items-center justify-center gap-2 group">
                        <FileText className="w-8 h-8 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-xs text-gray-400 font-medium">Drag & drop files here or click to browse</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">PDF, DICOM, JPG Supported</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Clinical Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add context or observations..."
                                        {...field}
                                        className="bg-white/5 border-white/10 min-h-[100px] focus:border-emerald-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Submit for Review
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
