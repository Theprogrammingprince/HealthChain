"use client";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function WalletConnectButton() {
    const { open } = useAppKit();
    const { address, isConnected } = useAccount();
    const { connectWallet, setUserRole } = useAppStore();
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const hasRegistered = useRef(false);

    useEffect(() => {
        const registerWalletUser = async () => {
            // Prevent duplicate registration attempts
            if (!isConnected || !address || isRegistering || hasRegistered.current) {
                return;
            }

            setIsRegistering(true);
            hasRegistered.current = true;

            try {
                // Connect wallet in app store
                const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                connectWallet(shortAddress);

                // Get stored role from signin page tab selection
                const storedRole = localStorage.getItem('healthchain_intended_role') || 'patient';
                const normalizedRole = storedRole.toLowerCase();

                // Set user role in app store
                setUserRole(normalizedRole === 'hospital' ? 'Hospital' : 'Patient');

                // Check if user exists - handle errors gracefully
                let userExists = false;
                try {
                    const checkResponse = await fetch(`/api/auth/profile?userId=${address}`);
                    userExists = checkResponse.ok;
                } catch (checkError) {
                    // Profile check failed - assume user doesn't exist, proceed with registration
                    console.warn('Profile check failed, attempting registration:', checkError);
                    userExists = false;
                }

                // Register if user doesn't exist
                if (!userExists) {
                    const registrationData = {
                        userId: address,
                        email: null,
                        walletAddress: address,
                        role: normalizedRole,
                        authProvider: 'wallet',
                        fullName: null,
                        avatarUrl: null,
                        ...(normalizedRole === 'hospital' && {
                            hospitalName: 'Medical Facility' // Will be updated on verification form
                        })
                    };

                    try {
                        const registerResponse = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(registrationData)
                        });

                        if (registerResponse.ok) {
                            toast.success('Wallet Connected!', {
                                description: normalizedRole === 'hospital'
                                    ? 'Redirecting to verification...'
                                    : 'Your account has been created'
                            });
                        } else {
                            // Registration failed but wallet is connected
                            // Still allow navigation so user can complete profile later
                            const errorData = await registerResponse.json().catch(() => ({}));
                            console.error('Registration response error:', errorData);

                            // If user already exists (409), that's fine
                            if (registerResponse.status === 409) {
                                toast.success('Wallet Connected!', {
                                    description: 'Welcome back'
                                });
                            } else {
                                toast.warning('Account setup incomplete', {
                                    description: 'You can complete your profile later'
                                });
                            }
                        }
                    } catch (registerError) {
                        console.error('Registration fetch error:', registerError);
                        toast.warning('Wallet connected', {
                            description: 'Profile will be set up on next visit'
                        });
                    }
                } else {
                    toast.success('Wallet Connected!', {
                        description: 'Welcome back'
                    });
                }

                // Clean up and redirect based on role
                localStorage.removeItem('healthchain_intended_role');

                // Redirect based on role
                if (normalizedRole === 'hospital') {
                    // Hospitals go to verification page (pending approval flow)
                    router.push('/clinical/verify');
                } else {
                    // Patients go to dashboard
                    router.push('/dashboard');
                }

            } catch (error) {
                console.error('Wallet registration error:', error);
                toast.error('Connection issue', {
                    description: 'Please try again'
                });
                hasRegistered.current = false; // Allow retry on error
            } finally {
                setIsRegistering(false);
            }
        };

        registerWalletUser();
    }, [isConnected, address, connectWallet, setUserRole, router, isRegistering]);

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
