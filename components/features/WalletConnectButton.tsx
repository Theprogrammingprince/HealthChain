import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
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
    const registrationAttempted = useRef(false);

    useEffect(() => {
        const handleWalletConnection = async () => {
            if (!isConnected || !address || isRegistering || registrationAttempted.current) return;

            registrationAttempted.current = true;
            setIsRegistering(true);

            try {
                // Connect wallet in app store
                const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                connectWallet(shortAddress);

                // Get stored role
                const storedRole = localStorage.getItem('healthchain_intended_role') || 'patient';
                const normalizedRole = storedRole.toLowerCase();

                // Update store
                setUserRole(normalizedRole === 'hospital' ? 'Hospital' : normalizedRole === 'admin' ? 'Admin' : 'Patient');

                // Step 1: Check if user profile exists
                const profileRes = await fetch(`/api/auth/profile?userId=${address}`);

                if (profileRes.ok) {
                    toast.success('Welcome back!');
                } else {
                    // Step 2: Register if not exists
                    const registrationData = {
                        userId: address,
                        walletAddress: address,
                        role: normalizedRole,
                        authProvider: 'wallet',
                        fullName: `Wallet User ${address.slice(-4)}`
                    };

                    const registerRes = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(registrationData)
                    });

                    if (registerRes.ok) {
                        toast.success('Wallet Registered!');
                    } else if (registerRes.status === 409) {
                        toast.success('Welcome back!');
                    } else {
                        throw new Error('Registration failed');
                    }
                }

                // Step 3: Redirect based on role and status
                localStorage.removeItem('healthchain_intended_role');

                let dbRole = normalizedRole;
                let verificationStatus = undefined;

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    dbRole = profileData.data?.user?.role || normalizedRole;
                    verificationStatus = profileData.data?.profile?.verification_status;
                }

                import("@/lib/routing").then(({ resolveRoute }) => {
                    const targetPath = resolveRoute(dbRole, verificationStatus);
                    router.push(targetPath);
                });

            } catch (error: any) {
                console.error('Wallet auth error:', error);
                toast.error('Auth issue', { description: error.message || 'Please try again' });
                registrationAttempted.current = false;
            } finally {
                setIsRegistering(false);
            }
        };

        if (isConnected && address) {
            handleWalletConnection();
        }
    }, [isConnected, address, router, connectWallet, setUserRole]);

    return (
        <Button
            onClick={() => open()}
            disabled={isRegistering}
            className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl"
        >
            {isRegistering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <Wallet className="mr-2 h-4 w-4 text-indigo-400" />
                    Connect Wallet
                </>
            )}
        </Button>
    );
}
