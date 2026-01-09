"use client";

import { useRouter } from "next/navigation";
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
import { User, LogOut, ChevronDown, Settings, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from 'wagmi';

export function AuthButton() {
    const router = useRouter();
    const { address, isConnected: isWagmiConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { walletAddress, isConnected, disconnectWallet, userRole } = useAppStore();

    const handleSignOut = () => {
        if (isWagmiConnected) {
            disconnect();
        }
        disconnectWallet();
        toast.info("Signed Out", {
            description: "You have been successfully signed out."
        });
        router.push('/');
    };

    const handleSignIn = () => {
        router.push('/signin');
    };

    // If user is authenticated (connected)
    if (isConnected && walletAddress) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-primary/50 text-white hover:bg-primary/10 transition-all duration-300">
                        <User className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{walletAddress}</span>
                        <span className="sm:hidden">Account</span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border text-white">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                        onClick={() => router.push('/dashboard')}
                        className="cursor-pointer focus:bg-muted focus:text-white"
                    >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer focus:bg-muted focus:text-white">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // If user is not authenticated - show Sign In / Sign Up button
    return (
        <Button
            onClick={handleSignIn}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,191,255,0.5)] transition-all duration-300 hover:scale-105"
        >
            <User className="mr-2 h-4 w-4" />
            Sign In / Sign Up
        </Button>
    );
}
