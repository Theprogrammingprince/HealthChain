"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, File, Lock, CheckCircle } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function FileUpload() {
    const { addRecord } = useAppStore();
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState<"idle" | "encrypting" | "uploading" | "done">("idle");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setStep("encrypting");
        setProgress(0);

        // Simulate Encryption
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setProgress(p);
            if (p >= 50 && step === "encrypting") {
                setStep("uploading");
            }
            if (p >= 100) {
                clearInterval(interval);
                setStep("done");

                // Add mock record
                addRecord({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: file.type.includes("pdf") ? "PDF" : "Image",
                    date: new Date().toISOString(),
                    ipfsHash: "Qm" + Math.random().toString(36).substr(2, 40),
                });

                toast.success("File Encrypted & Uploaded", {
                    description: `IPFS Hash: Qm...${Math.random().toString(36).substr(2, 6)}`
                });

                setTimeout(() => {
                    setStep("idle");
                    setProgress(0);
                }, 2000);
            }
        }, 100);
    }, [addRecord, step]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center cursor-pointer relative overflow-hidden group
          ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/30"}
        `}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {step === "idle" && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <CloudUpload className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Drop medical records here</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Drag & drop or click to upload. Files are AES-256 encrypted before IPFS storage.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {(step === "encrypting" || step === "uploading") && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            key="progress"
                            className="w-full max-w-sm mx-auto space-y-4"
                        >
                            <div className="flex items-center justify-center gap-2 text-primary font-mono mb-2">
                                {step === "encrypting" ? <Lock className="animate-pulse h-4 w-4" /> : <CloudUpload className="animate-bounce h-4 w-4" />}
                                {step === "encrypting" ? "Encrypting Data..." : "Uploading to IPFS..."}
                            </div>
                            {/* Simple Progress Bar if shadcn progress not installed, else just div */}
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{progress}% Complete</p>
                        </motion.div>
                    )}

                    {step === "done" && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-2 text-green-500"
                        >
                            <CheckCircle className="h-12 w-12" />
                            <p className="text-lg font-bold">Upload Complete!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
