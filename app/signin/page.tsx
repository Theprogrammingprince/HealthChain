'use client';

// Helper to redirect users to the AuthDialog via UI trigger or explicit page content
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
    const { isConnected, connectWallet } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (isConnected) router.push("/dashboard");
    }, [isConnected, router]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_50%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl relative z-10 text-center"
            >
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Wallet className="w-8 h-8 text-blue-500" />
                </div>

                <Button className="w-full" variant="secondary">
                    Connect Wallet
                </Button>
            </motion.div>
        </div>
    );
}
