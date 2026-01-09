"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessDeniedScreenProps {
    reason: 'revoked' | 'unauthorized';
    walletAddress: string;
    onDisconnect: () => void;
}

export function AccessDeniedScreen({ reason, walletAddress, onDisconnect }: AccessDeniedScreenProps) {
    const isRevoked = reason === 'revoked';

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full ${isRevoked ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {isRevoked ? <ShieldAlert size={48} /> : <Lock size={48} />}
                    </div>
                </div>

                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                    {isRevoked ? 'Access Revoked' : 'Unauthorized Access'}
                </h1>

                <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">
                    {isRevoked
                        ? `The Registry has revoked authorization for this node (${walletAddress}). This "Kill-Switch" event prevents any further clinical data interactions.`
                        : `The wallet address (${walletAddress}) is not whitelisted in the HealthChain Registry. Please contact the SuperAdmin.`
                    }
                </p>

                <div className="p-4 bg-black/40 rounded-xl border border-white/5 mb-8 text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Diagnostic Code</span>
                    </div>
                    <code className="text-xs text-gray-300 font-mono block break-all">
                        ERR_REGISTRY_{isRevoked ? 'REVOKED' : 'UNAUTHORIZED'}_0x992
                    </code>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={onDisconnect}
                        className={`w-full font-bold uppercase tracking-widest h-12 ${isRevoked ? 'bg-red-600 hover:bg-red-700' : 'bg-[#00BFFF] hover:bg-[#00BFFF]/80'}`}
                    >
                        Disconnect Session
                    </Button>
                    <Button variant="ghost" className="text-gray-500 hover:text-white text-xs">
                        Contact Support
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
