"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileEdit,
    Stethoscope,
    Activity,
    Save,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    FilePlus,
    History,
    UserCheck
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
import { Badge } from "@/components/ui/badge";
import { useAppStore, RecordType } from "@/lib/store";

const clinicalFormSchema = z.object({
    diagnosis: z.string().min(3, "Diagnosis is required"),
    notes: z.string().min(10, "Detailed clinical notes are required"),
    bloodPressure: z.string().optional(),
    glucose: z.string().optional(),
    vitalsUpdate: z.boolean(),
});

export function RecordEntryForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consentAcquired, setConsentAcquired] = useState(false);
    const { addRecord, updateVitals } = useAppStore();

    const form = useForm<z.infer<typeof clinicalFormSchema>>({
        resolver: zodResolver(clinicalFormSchema),
        defaultValues: {
            diagnosis: "",
            notes: "",
            bloodPressure: "",
            glucose: "",
            vitalsUpdate: false,
        },
    });

    async function handleConsent() {
        setIsSubmitting(true);
        // Simulate sending consent request to patient's wallet/email
        await new Promise(r => setTimeout(r, 2000));
        setConsentAcquired(true);
        setIsSubmitting(false);
        toast.success("Patient Consent Verified", {
            description: "Cryptographic authorization received from wallet 0x71C...345a",
            icon: <UserCheck className="text-emerald-500" />
        });
    }

    async function onSubmit(values: z.infer<typeof clinicalFormSchema>) {
        if (!consentAcquired) {
            toast.error("Consent Required", {
                description: "You must request and verify patient consent before submitting clinical records."
            });
            return;
        }

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 2500)); // Simulating IPFS + Blockchain Tx

        const newRecord = {
            id: Math.random().toString(36).substring(2, 11),
            name: values.diagnosis,
            type: 'Clinical Note' as RecordType,
            date: new Date().toISOString().split('T')[0],
            facility: 'Mayo Clinic - Central',
            doctor: 'Dr. Gabriel (Current Staff)',
            notes: values.notes,
            diagnosis: values.diagnosis,
            ipfsHash: "Qm" + Math.random().toString(36).substring(2, 15),
            category: 'Diagnosis' as any
        };

        addRecord(newRecord);

        if (values.bloodPressure || values.glucose) {
            updateVitals({
                bloodPressure: values.bloodPressure || undefined,
                glucose: values.glucose || undefined,
            });
        }

        toast.success("Clinical Record Anchored", {
            description: `Immutable entry created for ${values.diagnosis}. tx: 0x82...fed1`,
        });

        setIsSubmitting(false);
        setConsentAcquired(false);
        form.reset();
    }

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Stethoscope size={120} />
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <FileEdit className="text-[#00BFFF] w-6 h-6" />
                        Clinical Encounter Entry
                    </h2>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">New Consultation Record</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-white/10 text-gray-400 gap-1.5 px-3 py-1 bg-white/5">
                        <History size={12} /> Draft Saved
                    </Badge>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="diagnosis"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Primary Diagnosis</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Hypertension, Managed" {...field} className="bg-white/5 border-white/10 text-white h-12 focus:border-[#00BFFF]/50 rounded-xl" />
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
                                        <FormLabel className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Clinical Observations</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detailed examination notes and treatment plan..."
                                                {...field}
                                                className="bg-white/5 border-white/10 text-white min-h-[160px] focus:border-[#00BFFF]/50 rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="text-[#00BFFF] w-4 h-4" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encounter Vitals</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bloodPressure"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] text-gray-600 font-bold uppercase">BP (mmHg)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="120/80" {...field} className="bg-zinc-950 border-white/5 text-white h-10 rounded-lg" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="glucose"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] text-gray-600 font-bold uppercase">Glucose</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="95 mg/dL" {...field} className="bg-zinc-950 border-white/5 text-white h-10 rounded-lg" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-4 space-y-4">
                                    <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                        Note: Updating vitals here will reflect in the patient&apos;s global health vault upon submission.
                                    </p>
                                    <div className="p-4 rounded-xl bg-[#00BFFF]/5 border border-[#00BFFF]/10 flex items-center gap-3">
                                        <ShieldCheck className="text-[#00BFFF] w-4 h-4" />
                                        <span className="text-[10px] font-bold text-[#00BFFF] uppercase tracking-wider">Blockchain Audit Trail Enabled</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consent Authorization</p>
                                {!consentAcquired ? (
                                    <Button
                                        type="button"
                                        onClick={handleConsent}
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <UserCheck className="w-4 h-4 text-[#00BFFF]" />}
                                        Request Patient Digital Signature
                                    </Button>
                                ) : (
                                    <div className="w-full h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center gap-3">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-bold uppercase tracking-widest text-xs">Authorization Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                        <Button variant="ghost" type="button" className="h-12 px-6 text-gray-500 hover:text-white rounded-xl">
                            Discard Encounters
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !consentAcquired}
                            className="h-12 px-10 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-black rounded-xl shadow-lg shadow-[#00BFFF]/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ANCHORING...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    LOCK RECORD ON-CHAIN
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
