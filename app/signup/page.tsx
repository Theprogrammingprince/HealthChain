'use client';
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                    <Activity className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-gray-400 mb-8">Start your decentralized health journey.</p>

                <p className="text-sm text-gray-500 mb-6">
                    HealthChain uses your wallet as your identity. No password required. connect your wallet to get started.
                </p>

                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    Connect Wallet to Sign Up
                </Button>
            </div>
        </div>
    );
}
