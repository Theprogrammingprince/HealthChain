'use client';

// Helper to redirect users to the AuthDialog via UI trigger or explicit page content
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/features/AuthDialog";
import { Activity } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                    <Activity className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400 mb-8">Access your secure medical dashboard.</p>

                {/* 
               In a real app, this might just open the dialog automatically or show the form inline.
               For now, we'll suggest using the wallet connect in navbar or a button here if we had detailed auth logic.
            */}

                <p className="text-sm text-gray-500 mb-6">
                    Please connect your wallet using the button in the top right, or click below to learn more.
                </p>

                <Button className="w-full" variant="secondary">
                    Connect Wallet
                </Button>
            </div>
        </div>
    );
}
