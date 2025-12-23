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
import { Wallet, LogOut, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function WalletConnect() {
    const { walletAddress, isConnected, connectWallet, disconnectWallet } = useAppStore();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = (walletApp: string) => {
        setIsConnecting(true);
        // Simulate connection delay
        setTimeout(() => {
            const mockAddress = "0x71C...9B3"; // Simulated address
            connectWallet(mockAddress);
            setIsConnecting(false);
            toast.success("Wallet Connected", {
                description: `Connected to ${walletApp} as ${mockAddress}`,
            });
        }, 1500);
    };

    const handleDisconnect = () => {
        disconnectWallet();
        toast.info("Wallet Disconnected", {
            description: "You have securely logged out."
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
                    {isConnecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wallet className="mr-2 h-4 w-4" />
                    )}
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border text-white">
                <DropdownMenuLabel>Choose Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => handleConnect("MetaMask")} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-white">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="mr-2 h-5 w-5" />
                    MetaMask
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleConnect("Coinbase Wallet")} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-white">
                    {/* Simple circle for Coinbase if no icon, or logic to add icon */}
                    <div className="mr-2 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">C</div>
                    Coinbase Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleConnect("WalletConnect")} className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-white">
                    <div className="mr-2 h-5 w-5 rounded-full bg-blue-400 flex items-center justify-center text-[10px] text-white font-bold">W</div>
                    WalletConnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
