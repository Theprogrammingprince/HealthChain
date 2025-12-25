'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/features/WalletConnect";
import { toast } from "sonner";


export default function SignUpPage() {
    const { isConnected, address } = useAccount();
    const router = useRouter();
    const [step, setStep] = useState<"connect" | "register">("connect");
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    useEffect(() => {
        if (isConnected) {
            // Check if already registered (in local storage for now)
            // Use setTimeout to avoid set-state-in-effect warning
            setTimeout(() => {
                const savedProfile = localStorage.getItem("healthchain_user_profile");
                if (savedProfile) {
                    router.push("/dashboard");
                } else {
                    setStep("register");
                }
            }, 0);
        }
    }, [isConnected, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate saving profile
        await new Promise(resolve => setTimeout(resolve, 1500));

        const profile = {
            ...formData,
            walletAddress: address,
            emergencyContact: ""
        };

        localStorage.setItem("healthchain_user_profile", JSON.stringify(profile));

        toast.success("Identity Created", {
            description: "Welcome to HealthChain. Your secure dashboard is ready."
        });

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.15),transparent_50%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-8 h-8 text-purple-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3">
                        {step === "connect" ? "Create Account" : "Complete Profile"}
                    </h1>
                    <p className="text-gray-400">
                        {step === "connect"
                            ? "Your wallet is your identity. Connect to start."
                            : "Tell us a bit about yourself to secure your records."}
                    </p>
                </div>

                {step === "connect" ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-200 mb-6">
                            <p><strong>Note:</strong> HealthChain uses your wallet address to encrypt and store your medical data securely on Polygon.</p>
                        </div>
                        <div className="flex justify-center">
                            <WalletConnect />
                        </div>
                        <p className="text-xs text-gray-500 mt-6 text-center">
                            Already have an account? <a href="/signin" className="text-purple-400 hover:underline">Sign In</a>
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    required
                                    className="bg-white/5 border-white/10"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    required
                                    className="bg-white/5 border-white/10"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input
                                type="email"
                                className="bg-white/5 border-white/10"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-500 h-12 text-lg mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Identity..." : "Finalize Registration"}
                        </Button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
