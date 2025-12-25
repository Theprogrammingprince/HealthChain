'use client';
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
    const { isConnected, connectWallet } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (isConnected) router.push("/dashboard");
    }, [isConnected, router]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.15),transparent_50%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl relative z-10 text-center"
            >
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-purple-500" />
                </div>

                <h1 className="text-3xl font-bold mb-3">Create Account</h1>
                <p className="text-gray-400 mb-8">Your wallet is your identity. Connect to start your secure health journey.</p>

                <Button
                    size="lg"
                    className="w-full bg-purple-600 hover:bg-purple-500 h-12 text-lg shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                    onClick={() => connectWallet("0x123...456")} // Simulate connection
                >
                    Create Identity
                </Button>

                <p className="text-xs text-gray-500 mt-6">
                    Already have an account? <a href="/signin" className="text-purple-400 hover:underline">Sign In</a>
                </p>
            </motion.div>
        </div>
    );
}
