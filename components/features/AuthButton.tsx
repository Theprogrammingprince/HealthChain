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
import { User, LogOut, ChevronDown, Settings, UserCircle, Activity, LayoutDashboard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from 'wagmi';
import { supabase } from "@/lib/supabaseClient";

export function AuthButton() {
    const router = useRouter();
    const { isConnected: isWagmiConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { walletAddress, isConnected, disconnectWallet, userRole } = useAppStore();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            if (isWagmiConnected) {
                disconnect();
            }
            disconnectWallet();
            toast.info("Signed Out", {
                description: "You have been successfully signed out."
            });
            router.push('/');
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const handleSignIn = () => {
        router.push('/auth');
    };

    const getDashboardPath = () => {
        switch (userRole?.toLowerCase()) {
            case 'admin': return '/admin';
            case 'hospital': return '/clinical';
            case 'patient': return '/dashboard';
            default: return '/dashboard';
        }
    };

    const getRoleIcon = () => {
        switch (userRole?.toLowerCase()) {
            case 'admin': return <ShieldCheck className="w-4 h-4 text-red-400" />;
            case 'hospital': return <Activity className="w-4 h-4 text-indigo-400" />;
            default: return <UserCircle className="w-4 h-4 text-[#00BFFF]" />;
        }
    };

    // If user is authenticated
    if (isConnected && (walletAddress || userRole)) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 rounded-xl h-10 group px-4">
                        <div className="mr-2 hidden sm:block">
                            {getRoleIcon()}
                        </div>
                        <span className="hidden sm:inline font-bold uppercase text-[9px] tracking-widest">
                            {userRole || 'Signed In'}
                        </span>
                        <span className="sm:hidden font-bold uppercase text-[9px] tracking-widest">Account</span>
                        <ChevronDown className="ml-2 h-3 w-3 text-gray-500 group-data-[state=open]:rotate-180 transition-transform" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0F0F0F] border-white/10 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                    <DropdownMenuLabel className="font-bold uppercase text-[9px] tracking-[0.2em] text-gray-500 px-3 py-2">
                        Account Protocol
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5 mx-2" />
                    <DropdownMenuItem
                        onClick={() => router.push(getDashboardPath())}
                        className="cursor-pointer focus:bg-white/5 rounded-xl px-3 py-2.5 transition-colors group"
                    >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-gray-400 group-focus:text-indigo-400" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.push(userRole === 'Hospital' ? '/clinical/settings' : '/settings')}
                        className="cursor-pointer focus:bg-white/5 rounded-xl px-3 py-2.5 transition-colors group"
                    >
                        <Settings className="mr-3 h-4 w-4 text-gray-400 group-focus:text-indigo-400" />
                        <span className="text-sm font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5 mx-2" />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer rounded-xl px-3 py-2.5 transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // If user is not authenticated
    return (
        <Button
            onClick={handleSignIn}
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:scale-105 rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest"
        >
            <User className="mr-2 h-4 w-4" />
            Get Started
        </Button>
    );
}
