"use client";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function WalletConnectButton() {
    const { open } = useAppKit();
    const { address, isConnected } = useAccount();
    const { connectWallet } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (isConnected && address) {
            connectWallet(address);
            router.push("/dashboard");
        }
    }, [isConnected, address, connectWallet, router]);

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
