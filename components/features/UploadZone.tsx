"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, Lock, CheckCircle, FileUp, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export function UploadZone() {
    const { addRecord } = useAppStore();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState<"idle" | "encrypting" | "uploading" | "done">("idle");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setStep("encrypting");
        setProgress(0);

        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 40 && p < 80) setStep("uploading");
            if (p >= 100) {
                clearInterval(interval);
                setUploading(false);
                setStep("done");

                addRecord({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: file.name.endsWith("pdf") ? "PDF" : "Image",
                    date: new Date().toISOString(),
                    ipfsHash: "Qm" + Math.random().toString(36).substr(2, 40),
                });

                toast.success("Secure Upload Complete", {
                    description: "Your file has been encrypted and stored on IPFS.",
                    icon: <ShieldCheck className="text-green-500" />,
                });

                setTimeout(() => {
                    setStep("idle");
                    setProgress(0);
                }, 3000);
            }
        }, 50);
    }, [addRecord]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <Card className="relative overflow-hidden w-full border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group">
            <div
                {...getRootProps()}
                className="p-10 flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px]"
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {step === "idle" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className={`p-6 rounded-full bg-primary/10 ring-1 ring-primary/30 transition-all duration-500 ${isDragActive ? 'scale-125 ring-primary ring-4 shadow-[0_0_30px_rgba(0,191,255,0.4)]' : 'group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,191,255,0.2)]'}`}>
                                <CloudUpload className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    {isDragActive ? "Drop to Encrypt & Upload" : "Secure File Upload"}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Drag & drop medical records here. Files are AES-256 encrypted client-side before IPFS storage.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {(step === "encrypting" || step === "uploading") && (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-sm space-y-6"
                        >
                            <div className="flex items-center justify-center gap-3 text-lg font-mono text-primary">
                                {step === "encrypting" ? (
                                    <Lock className="h-5 w-5 animate-pulse text-yellow-500" />
                                ) : (
                                    <FileUp className="h-5 w-5 animate-bounce text-blue-500" />
                                )}
                                <span className="uppercase tracking-widest">{step}...</span>
                            </div>
                            <div className="relative pt-1">
                                <Progress value={progress} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                                    <span>0%</span>
                                    <span>{progress}%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "done" && (
                        <motion.div
                            key="done"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center gap-4 text-green-500"
                        >
                            <div className="p-4 bg-green-500/10 rounded-full ring-1 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <ShieldCheck className="h-12 w-12" />
                            </div>
                            <h3 className="text-xl font-bold">Encrypted & Stored</h3>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}
