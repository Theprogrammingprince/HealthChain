"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { toast } from "sonner";

export function GoogleLoginButton({ role = 'Patient' }: { role?: 'Patient' | 'Hospital' | 'Doctor' }) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleLogin = async () => {
        setIsConnecting(true);
        try {
            // Save role to localStorage so we can retrieve it after redirect
            localStorage.setItem('healthchain_intended_role', role);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                if (error.message.includes("provider is not enabled")) {
                    toast.error("Google Auth Disabled", {
                        description: "Please enable Google in your Supabase Dashboard -> Auth -> Providers."
                    });
                } else {
                    toast.error("Login Failed", { description: error.message });
                }
                throw error;
            }
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50 text-gray-700"
            disabled={isConnecting}
        >
            {isConnecting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </span>
            )}
        </Button>
    );
}
