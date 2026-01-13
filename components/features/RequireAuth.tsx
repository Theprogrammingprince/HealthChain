"use client";

import { useAppStore, StaffRole } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface RequireAuthProps {
    children: React.ReactNode;
    requiredRole?: 'Patient' | 'Hospital';
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
    const { isAuthenticated, isConnected, userRole, supabaseSession } = useAppStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            // Check basic auth
            if (!isConnected || !isAuthenticated || !supabaseSession?.user) {
                router.push("/");
                return;
            }

            // Check role match
            if (requiredRole && userRole !== requiredRole) {
                // Wrong role redirect
                if (userRole === 'Hospital') {
                    router.push("/clinical/verify");
                } else if (userRole === 'Patient') {
                    router.push("/dashboard");
                }
                return;
            }

            // Additional check for Hospital role: verify verification status
            if (requiredRole === 'Hospital' || userRole === 'Hospital') {
                try {
                    const { data: hospitalData, error } = await supabase
                        .from("hospital_profiles")
                        .select("verification_status, is_verified")
                        .eq("user_id", supabaseSession.user.id)
                        .single();

                    // If no profile or not verified, redirect to verification page
                    if (error || !hospitalData || !hospitalData.is_verified) {
                        // Only redirect if not already on verify page
                        if (window.location.pathname !== '/clinical/verify') {
                            router.push("/clinical/verify");
                            return;
                        }
                    } else if (hospitalData.is_verified && window.location.pathname === '/clinical/verify') {
                        // If verified but on verify page, redirect to dashboard
                        router.push("/clinical");
                        return;
                    }
                } catch (error) {
                    console.error("Error checking hospital verification:", error);
                }
            }

            setIsChecking(false);
        };

        // Allow a small delay for hydration/state restoration
        const timer = setTimeout(checkAccess, 500);
        return () => clearTimeout(timer);
    }, [isConnected, isAuthenticated, userRole, requiredRole, router, supabaseSession]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00BFFF]" />
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Verifying Session...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
