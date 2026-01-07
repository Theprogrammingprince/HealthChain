"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Loader2, ChevronDown, Chrome } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useEffect } from "react";


export function WalletConnect() {
    const { address, isConnected: isWagmiConnected, isConnecting: isWagmiConnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { walletAddress, isConnected, connectWallet, disconnectWallet } = useAppStore();

    // Sync wagmi state with AppStore
    useEffect(() => {
        if (isWagmiConnected && address) {
            if (!isConnected || walletAddress !== address) {
                // Shorten address for UI if needed, but the store expects the full address usually
                // The existing store uses "0x71C...9B3" for mock, let's pass the real one
                connectWallet(address);
                toast.success("Wallet Connected", {
                    description: `Connected as ${address.slice(0, 6)}...${address.slice(-4)}`,
                });
            }
        } else if (!isWagmiConnected && isConnected) {
            disconnectWallet();
        }
    }, [isWagmiConnected, address, isConnected, walletAddress, connectWallet, disconnectWallet]);

    const handleConnect = async () => {
        try {
            await open();
        } catch (error) {
            console.error("Failed to open AppKit modal:", error);
            toast.error("Cloud Connection Error", {
                description: "Could not open the wallet modal. Please check your internet connection or Project ID."
            });
        }
    };

    const handleSocialConnect = async () => {
        try {
            await open({ view: 'Connect' }); // This allows email/google login
        } catch (error) {
            console.error("Failed to open Social Login:", error);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        // Zustand store is synced in useEffect
        toast.info("Logged Out", {
            description: "You have securely disconnected."
        });
    };

    if (isConnected) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-primary/50 text-white hover:bg-primary/10 transition-all duration-300">
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        {walletAddress}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border text-white">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="cursor-pointer focus:bg-muted focus:text-white">
                        <Wallet className="mr-2 h-4 w-4" /> View On Polygon
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={handleDisconnect} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,191,255,0.5)] transition-all duration-300 hover:scale-105">
                    {isWagmiConnecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wallet className="mr-2 h-4 w-4" />
                    )}
                    {isWagmiConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border text-white">
                <DropdownMenuLabel>Sign In Methods</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => handleConnect()} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-white">
                    <Wallet className="mr-2 h-4 w-4" />
                    Browser Wallets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialConnect()} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-white">
                    <Chrome className="mr-2 h-4 w-4 text-primary" />
                    Google / Email
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
