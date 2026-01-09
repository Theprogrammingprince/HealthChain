'use client';

import { Lock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLoginButton } from "@/components/features/GoogleLoginButton";
import { WalletConnectButton } from "@/components/features/WalletConnectButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect } from "react";

export default function SignUpPage() {
    const [role, setRole] = useState<'Patient' | 'Hospital'>('Patient');
    const { setUserRole, userRole } = useAppStore();
    const router = useRouter();
    const { isConnected } = useAccount();

    useEffect(() => {
        if (isConnected) {
            setUserRole(role);
            if (role === 'Hospital') {
                router.push('/clinical');
            } else {
                router.push('/dashboard');
            }
        }
    }, [isConnected, role, setUserRole, router]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header / Logo Area */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
                            <Activity className="w-10 h-10 text-indigo-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Join HealthChain
                    </h1>
                    <p className="text-gray-400 text-lg mb-6">
                        {role === 'Patient' ? 'Own Your Medical Data' : 'Clinical Provider Access'}
                    </p>

                    <Tabs defaultValue="Patient" onValueChange={(v) => setRole(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            <TabsTrigger value="Patient" className="rounded-lg data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black text-gray-400 font-bold uppercase text-[10px] tracking-widest transition-all">
                                Individual
                            </TabsTrigger>
                            <TabsTrigger value="Hospital" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-gray-400 font-bold uppercase text-[10px] tracking-widest transition-all">
                                Hospital
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl">
                    <div className="space-y-6">

                        {/* Option 1: Google (Web3Auth) */}
                        <div className="space-y-2">
                            <GoogleLoginButton />
                            <p className="text-[10px] text-gray-500 text-center">
                                Powered by Web3Auth (MPC) • Non-custodial wallet created instantly
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0A0A0A] px-2 text-gray-500">Or connect existing</span>
                            </div>
                        </div>

                        {/* Option 2: Wallet Connect */}
                        <div className="space-y-2">
                            <WalletConnectButton />
                        </div>

                    </div>

                    {/* Privacy Badge */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-emerald-500/80 bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
                        <Lock className="w-3 h-3" />
                        <span className="font-semibold">End-to-End Encrypted</span>
                        <span className="text-gray-500">• Zero-Knowledge Privacy</span>
                    </div>
                </div>

                {/* Footer Terms */}
                <p className="text-center text-xs text-gray-600 mt-8">
                    By connecting, you agree to our <span className="text-gray-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-gray-400 cursor-pointer hover:underline">Privacy Protocol</span>.
                </p>
            </motion.div>
        </div>
    );
}
