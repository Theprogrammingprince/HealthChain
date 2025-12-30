"use client";

import { motion } from "framer-motion";
import { HospitalVerificationTable } from "@/components/admin/HospitalVerificationTable";
import { PaymasterMonitor } from "@/components/admin/PaymasterMonitor";
import { ComplianceTerminal } from "@/components/admin/ComplianceTerminal";
import { Settings, Shield, Globe2 } from "lucide-react";

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-[#050505] pb-20">
            {/* Admin Header */}
            <header className="bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-600/30">
                            <Shield className="text-blue-500" size={16} />
                        </div>
                        <span className="text-lg font-black text-white uppercase tracking-tighter">HealthChain <span className="text-blue-500">Registry</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <Globe2 size={12} className="text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mainnet Alpha</span>
                        </div>
                        <Link href="/admin/settings" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <Settings size={18} className="text-gray-400" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

                {/* Top Section: Economy & Compliance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[350px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="h-full"
                    >
                        <PaymasterMonitor />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-full"
                    >
                        <ComplianceTerminal />
                    </motion.div>
                </div>

                {/* Bottom Section: Verification Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <HospitalVerificationTable />
                </motion.div>

            </main>
        </div>
    );
}
