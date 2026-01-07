'use client';

import { Activity, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLoginButton } from "@/components/features/GoogleLoginButton";
import { WalletConnectButton } from "@/components/features/WalletConnectButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useAccount } from "wagmi";

export default function SignInPage() {
    const { isConnected } = useAccount();
    const router = useRouter();
    const [role, setRole] = useState<'Patient' | 'Hospital'>('Patient');
    const { setUserRole } = useAppStore();

    useEffect(() => {
        if (isConnected) {
            setUserRole(role);
            if (role === 'Hospital') {
                router.push('/clinical');
            } else {
                router.push('/dashboard');
            }
        }
    }, [isConnected, router, role, setUserRole]);

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
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 text-lg mb-6">
                        Securely Access Your Data
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
                            <GoogleLoginButton role={role} />
                            <p className="text-[10px] text-gray-500 text-center">
                                Powered by Supabase Auth • Secure OAuth2
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0A0A0A] px-2 text-gray-500">Or use wallet</span>
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
                        <span className="font-semibold">Secured by Blockchain</span>
                        <span className="text-gray-500">• Private & Encrypted</span>
                    </div>
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-gray-600 mt-8">
                    Don&apos;t have an account? <Link href="/signup" className="text-indigo-400 cursor-pointer hover:underline">Sign up for free</Link>
                </p>
            </motion.div>
        </div>
    );
}
