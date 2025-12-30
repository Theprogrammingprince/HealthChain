"use client";

import Image from "next/image";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, User, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PassportPhotoUpload() {
    const { profileImage, setProfileImage } = useAppStore();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File too large", { description: "Passport photo must be under 2MB" });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfileImage(base64String);
                toast.success("Passport Uploaded", { description: "Your clinical identity has been updated." });
            };
            reader.readAsDataURL(file);
        }
    }, [setProfileImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
        multiple: false
    });

    return (
        <div className="relative group">
            <motion.div
                className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-indigo-500/50"
                {...getRootProps()}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {profileImage ? (
                        <motion.div
                            key="image"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={profileImage}
                                alt="Passport"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <Camera className="text-white w-8 h-8" />
                                <span className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</span>
                            </div>
                            <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full shadow-lg">
                                <CheckCircle2 className="text-white w-4 h-4" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full p-6 text-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                                <User size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">Passport Photo</p>
                                <p className="text-[10px] text-gray-500 mt-1">Upload a clear, high-visibility clinical photo</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">
                                <Upload className="w-3 h-3 mr-2" /> Select File
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isDragActive && (
                    <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm border-2 border-indigo-500 flex items-center justify-center z-20">
                        <p className="text-white font-bold uppercase tracking-widest text-xs">Drop Passport Here</p>
                    </div>
                )}
            </motion.div>

            {profileImage && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setProfileImage("");
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-xl shadow-red-500/20 opacity-0 group-hover:opacity-100 transition-all z-30"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
