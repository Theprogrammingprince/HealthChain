"use client";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { resolveRoute, VerificationStatus } from "@/lib/routing";
import { usePathname } from "next/navigation";

interface RequireAuthProps {
    children: React.ReactNode;
    requiredRole?: 'Patient' | 'Hospital' | 'Admin';
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
    const { isAuthenticated, isConnected, walletAddress, userRole, supabaseSession, setUserRole } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            // Check basic auth
            // If user is neither connected (wallet) nor authenticated (email), redirect.
            // But if they are authenticated via email (supabaseSession), that's enough.
            if (!isAuthenticated && !supabaseSession?.user && !isConnected) {
                router.push("/auth");
                return;
            }

            // If we have a session, we are authenticated
            if (supabaseSession?.user) {
                // Good to go
            } else if (!isConnected) {
                // If no session and no wallet, then fail
                router.push("/auth");
                return;
            }

            // Stricter verification: Fetch the latest role and verification status from the database
            let currentRole = userRole;
            let verificationStatus: VerificationStatus | undefined;

            try {
                // Determine the User ID and lookup field (id for email, wallet_address for wallet)
                const userId = supabaseSession?.user?.id || walletAddress;

                if (userId) {
                    // Fetch User Role from DB (Don't rely solely on store as it might be stale)
                    const { data: profile, error: roleError } = await supabase
                        .from("users")
                        .select("id, role")
                        .eq(supabaseSession?.user?.id ? "id" : "wallet_address", userId)
                        .single();

                    if (profile && !roleError) {
                        currentRole = profile.role.charAt(0).toUpperCase() + profile.role.slice(1) as any;
                        if (currentRole !== userRole) {
                            setUserRole(currentRole);
                        }
                    }

                    // If Hospital, fetch Verification Status
                    if (currentRole === 'Hospital') {
                        const { data: hospitalData, error: hospError } = await supabase
                            .from("hospital_profiles")
                            .select("verification_status")
                            .eq("user_id", supabaseSession?.user?.id ? userId : (profile?.id || userId)) // If wallet, find profile.id
                            .single();

                        // Fallback: if we didn't find by user_id directly and we are a wallet user, 
                        // the profile.id from the 'users' table lookup above is the real FK
                        if (hospError && !supabaseSession?.user?.id && profile?.id) {
                            const { data: retryData } = await supabase
                                .from("hospital_profiles")
                                .select("verification_status")
                                .eq("user_id", profile.id)
                                .single();
                            if (retryData) {
                                verificationStatus = retryData.verification_status as VerificationStatus;
                            }
                        } else if (hospitalData && !hospError) {
                            verificationStatus = hospitalData.verification_status as VerificationStatus;
                        }
                    }
                }
            } catch (err) {
                console.error("Critical: Role/Verification check failed", err);
            }

            // Centralized Routing Rule Enforcement
            const targetPath = resolveRoute(currentRole || 'patient', verificationStatus);
            const currentPath = pathname;

            // 1. If requiredRole is specified and user has a DIFFERENT role, force redirect to THEIR correct dashboard
            if (requiredRole && currentRole !== requiredRole) {
                router.push(targetPath);
                return;
            }

            // 2. If user is on a dashboard that doesn't match their status (e.g. verified on /verify), force redirect
            // Note: We check if the current path starts with the base of the target path or matches exactly to avoid loops
            // but for HealthChain, paths are specific enough (/clinical/dashboard, /clinical/verify, /clinical/rejected)
            if (currentPath !== targetPath) {
                // Only redirect if they are on a "protected" path that doesn't match their status
                // If they are on the WRONG dashboard for their role/status, fix it.
                const protectedPaths = ['/patient/dashboard', '/clinical/dashboard', '/clinical/verify', '/clinical/rejected', '/admin/dashboard'];
                if (protectedPaths.includes(currentPath)) {
                    router.push(targetPath);
                    return;
                }
            }

            setIsChecking(false);
        };

        // Allow a small delay for hydration/state restoration
        const timer = setTimeout(checkAccess, 100);
        return () => clearTimeout(timer);
    }, [isConnected, walletAddress, isAuthenticated, userRole, requiredRole, router, pathname, supabaseSession, setUserRole]);

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
