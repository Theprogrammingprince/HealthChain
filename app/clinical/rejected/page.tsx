"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClinicalRejectedPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-[#0A0A0A] border border-red-900/20 rounded-3xl p-8 text-center space-y-6"
            >
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                        <XCircle className="text-red-500" size={40} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white tracking-tight">Access Restricted</h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Your hospital verification was not approved. This could be due to incomplete documentation or registry compliance issues.
                    </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-4 text-left">
                    <ShieldAlert className="text-red-500 shrink-0" size={20} />
                    <p className="text-[11px] text-gray-400 leading-normal font-medium uppercase tracking-wide">
                        For security reasons, access to clinical dashboards requires an authoritative medical license verification.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <Button
                        asChild
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 rounded-xl"
                    >
                        <Link href="/auth">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Link>
                    </Button>
                    <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl"
                    >
                        <Mail className="mr-2 h-4 w-4" /> Contact Support
                    </Button>
                </div>

                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest pt-4">
                    HealthChain Governance Node Registry
                </p>
            </motion.div>
        </div>
    );
}
