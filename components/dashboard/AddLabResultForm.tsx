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
    FlaskConical,
    CheckCircle2,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
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
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAppStore, RecordType } from "@/lib/store";

const formSchema = z.object({
    testName: z.string().min(2, "Test name is required"),
    testType: z.string().min(1, "Please select a test type"),
    facilityName: z.string().min(2, "Facility name is required"),
    doctorName: z.string().min(2, "Doctor name is required"),
    testDate: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

export function AddLabResultForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { addRecord } = useAppStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            testName: "",
            testType: "",
            facilityName: "",
            doctorName: "",
            testDate: new Date().toISOString().split('T')[0],
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

        const newRecord = {
            id: Math.random().toString(36).substring(2, 11),
            name: values.testName,
            type: values.testType as RecordType,
            date: values.testDate,
            facility: values.facilityName,
            doctor: values.doctorName,
            notes: values.notes,
            ipfsHash: "Qm" + Math.random().toString(36).substring(2, 15),
        };

        addRecord(newRecord);

        toast.success("Record Encrypted & Secured", {
            description: "Data stored on IPFS and hash registered on Polygon.",
        });

        setIsUploading(false);
        setUploadProgress(0);
        setFiles([]);
        form.reset();
    }

    return (
        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FlaskConical size={120} />
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Plus size={24} />
                    </div>
                    Add New lab Result
                </h2>
                <p className="text-gray-400 mt-2">
                    Your medical records are encrypted before being stored on the blockchain.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="testName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Test Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Blood Glucose Panel" {...field} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="testType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Test Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-indigo-500/30">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                            <SelectItem value="Lab">Lab Result</SelectItem>
                                            <SelectItem value="Scan">Imaging / Scan</SelectItem>
                                            <SelectItem value="Prescription">Prescription</SelectItem>
                                            <SelectItem value="PDF">General Document</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="facilityName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Facility / Clinic</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mayo Clinic" {...field} className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="testDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Date of Test</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="doctorName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Ordering Physician</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dr. John Doe" {...field} className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-300 mb-2 block font-sans">
                                Medical Documents
                            </label>
                            <div
                                {...getRootProps()}
                                className={`
                  border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
                  flex flex-col items-center justify-center gap-3
                  ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'}
                `}
                            >
                                <input {...getInputProps()} />
                                <div className="p-4 rounded-full bg-white/5 text-gray-400 group-hover:text-indigo-400 transition-colors">
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-medium">Click or drag files to upload</p>
                                    <p className="text-gray-500 text-xs mt-1">PDF, PNG, JPG up to 10MB</p>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="mt-4 space-y-2">
                                <AnimatePresence>
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={`${file.name}-${idx}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="text-indigo-400" size={18} />
                                                <span className="text-sm text-gray-300 truncate max-w-[200px]">{file.name}</span>
                                                <span className="text-[10px] text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Clinical Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional context about the results..."
                                                className="bg-white/5 border-white/10 text-white min-h-[100px] focus:border-indigo-500/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-400 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Encrypting & Syncing with IPFS...
                                    </span>
                                    <span className="text-gray-500">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-1 bg-white/5" />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
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
                                    Finalize & Secure to Blockchain
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
}
