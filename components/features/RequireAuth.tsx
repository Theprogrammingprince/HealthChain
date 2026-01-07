"use client";

import { useAppStore, StaffRole } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
    children: React.ReactNode;
    requiredRole?: 'Patient' | 'Hospital';
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
    const { isAuthenticated, isConnected, userRole } = useAppStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Allow a small delay for hydration/state restoration
        const timer = setTimeout(() => {
            if (!isConnected || !isAuthenticated) {
                router.push("/signin");
                return;
            }

            if (requiredRole && userRole !== requiredRole) {
                // Wrong role redirect
                if (userRole === 'Hospital') {
                    router.push("/clinical");
                } else {
                    router.push("/dashboard");
                }
                return;
            }

            setIsChecking(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [isConnected, isAuthenticated, userRole, requiredRole, router]);

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
