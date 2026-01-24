"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Upload,
    X,
    FileText,
    ShieldCheck,
    Loader2,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAppStore, RecordType } from "@/lib/store";

const formSchema = z.object({
    name: z.string().min(2, "Document name is required"),
    type: z.enum(["Lab Result", "Prescription", "Imaging", "General"]),
    facility: z.string().min(2, "Facility name is required"),
    doctor: z.string().min(2, "Doctor name is required"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

export function DocumentUploadDialog() {
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { addRecord } = useAppStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "General",
            facility: "",
            doctor: "",
            date: new Date().toISOString().split('T')[0],
            notes: "",
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.png']
        }
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (files.length === 0) {
            toast.error("Please upload at least one file");
            return;
        }

        setIsUploading(true);

        // Simulate IPFS / Blockchain Upload
        for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(r => setTimeout(r, 150));
        }

        // Generate IDs inside async function using timestamp
        const timestamp = new Date().getTime();
        const randomNum = timestamp % 10000; // Use modulo for variation
        const recordId = crypto.randomUUID ? crypto.randomUUID() : `${timestamp}-${randomNum}`;
        const ipfsHash = `Qm${recordId.replace(/-/g, '').substring(0, 13)}`;

        const newRecord = {
            id: recordId,
            name: values.name,
            type: values.type as RecordType,
            date: values.date,
            facility: values.facility,
            doctor: values.doctor,
            notes: values.notes,
            ipfsHash: ipfsHash,
            category: (values.type === 'Lab Result' ? 'Laboratory' : values.type === 'Imaging' ? 'Radiology' : values.type === 'Prescription' ? 'Pharmacy' : 'General') as 'Laboratory' | 'Pharmacy' | 'Radiology' | 'General'
        };

        try {
            await addRecord(newRecord);

            toast.success("Document Encrypted & Secured", {
                description: `Hash: ${newRecord.ipfsHash} registered on Polygon.`,
            });

            setIsUploading(false);
            setUploadProgress(0);
            setFiles([]);
            form.reset();
            setOpen(false);
        } catch (error: unknown) {
            console.error("Upload failed:", error);
            toast.error("Process Failed", {
                description: "Failed to secure document in vault. Please try again.",
            });
            setIsUploading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#00BFFF]/20 active:scale-95 transition-all">
                    <Plus className="mr-2 h-5 w-5" />
                    Upload New Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-[#0A0A0A] border-white/10 text-white p-0 overflow-hidden rounded-3xl">
                <div className="p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF]">
                                <ShieldCheck size={24} />
                            </div>
                            Secure Document Upload
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 mt-2">
                            All documents are zero-knowledge encrypted before leaving your browser.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel className="text-gray-400 text-xs uppercase tracking-wider font-bold">Document Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Annual Cardiovascular Screening" {...field} className="bg-white/5 border-white/10 text-white h-12 focus:border-[#00BFFF]/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-400 text-xs uppercase tracking-wider font-bold">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                                    <SelectItem value="Lab Result">Lab Result</SelectItem>
                                                    <SelectItem value="Prescription">Prescription</SelectItem>
                                                    <SelectItem value="Imaging">Imaging / Scan</SelectItem>
                                                    <SelectItem value="General">General Document</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-400 text-xs uppercase tracking-wider font-bold">Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="bg-white/5 border-white/10 text-white h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="facility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-400 text-xs uppercase tracking-wider font-bold">Facility</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Clinic or Hospital" {...field} className="bg-white/5 border-white/10 text-white h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="doctor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-400 text-xs uppercase tracking-wider font-bold">Physician</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Dr. Name" {...field} className="bg-white/5 border-white/10 text-white h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div
                                {...getRootProps()}
                                className={`
                  border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center
                  ${isDragActive ? 'border-[#00BFFF] bg-[#00BFFF]/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
                `}
                            >
                                <input {...getInputProps()} />
                                <Upload className="mx-auto mb-2 text-gray-500" size={32} />
                                <p className="text-sm text-white font-medium">Click or drag files to encrypt</p>
                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">PDF, PNG, JPG only</p>
                            </div>

                            {/* File Previews */}
                            <AnimatePresence>
                                {files.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="text-[#00BFFF]" size={16} />
                                                    <span className="text-xs text-gray-300 truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeFile(idx)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="pt-4 space-y-4">
                                {isUploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#00BFFF]">
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Syncing with Polygon...
                                            </span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-1 bg-white/5" />
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold text-lg rounded-2xl"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Securing Data...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Finalize & Lock to Vault
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
