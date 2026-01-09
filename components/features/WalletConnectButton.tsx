"use client";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function WalletConnectButton() {
    const { open } = useAppKit();
    const { address, isConnected } = useAccount();
    const { connectWallet, userRole } = useAppStore();
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const registerWalletUser = async () => {
            if (isConnected && address && !isRegistering) {
                setIsRegistering(true);

                try {
                    // Connect wallet in app store
                    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                    connectWallet(shortAddress);

                    // Get stored role
                    const storedRole = localStorage.getItem('healthchain_intended_role') || 'patient';

                    // Check if user exists
                    const checkResponse = await fetch(`/api/auth/profile?userId=${address}`);

                    // Register if doesn't exist
                    if (checkResponse.status === 404) {
                        const registrationData = {
                            userId: address,
                            email: null,
                            walletAddress: address,
                            role: storedRole.toLowerCase(),
                            authProvider: 'wallet',
                            fullName: null,
                            avatarUrl: null,
                            ...(storedRole.toLowerCase() === 'hospital' && {
                                hospitalName: 'Medical Facility' // Can be updated later
                            })
                        };

                        const registerResponse = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(registrationData)
                        });

                        if (registerResponse.ok) {
                            toast.success('Wallet Connected!', {
                                description: 'Your account has been created'
                            });
                        }
                    } else {
                        toast.success('Wallet Connected!', {
                            description: 'Welcome back'
                        });
                    }

                    localStorage.removeItem('healthchain_intended_role');
                } catch (error) {
                    console.error('Wallet registration error:', error);
                    toast.error('Registration incomplete', {
                        description: 'Connected but profile setup failed'
                    });
                } finally {
                    setIsRegistering(false);
                }
            }
        };

        registerWalletUser();
    }, [isConnected, address, connectWallet, isRegistering]);

    return (
        <Button
            onClick={() => open()}
            variant="outline"
            className="w-full h-12 text-base font-medium border-white/10 hover:border-white/20 hover:bg-white/5"
        >
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
        </Button>
    );
}
