/**
 * Centralized routing logic for HealthChain.
 * Ensures deterministic redirects based on role and verification status.
 */

export type UserRole = 'patient' | 'hospital' | 'admin' | string;
export type VerificationStatus = 'pending' | 'verified' | 'approved' | 'rejected' | string;

export function resolveRoute(role: UserRole, status?: VerificationStatus): string {
    const normalizedRole = role?.toLowerCase();
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedRole) {
        case 'admin':
            return '/admin/dashboard';

        case 'hospital':
            // Rule: If verification_status === "pending" → /clinical/verify
            if (normalizedStatus === 'pending') {
                return '/clinical/verify';
            }
            // Rule: If verification_status === "approved" (or verified) → /clinical/dashboard
            if (normalizedStatus === 'approved' || normalizedStatus === 'verified') {
                return '/clinical/dashboard';
            }
            // Rule: If verification_status === "rejected" → /clinical/rejected
            if (normalizedStatus === 'rejected') {
                return '/clinical/rejected';
            }
            // Default fallback for hospitals (likely needs verification)
            return '/clinical/verify';

        case 'doctor':
            return '/doctor/dashboard';

        case 'patient':
            return '/patient/dashboard';

        default:
            // Fallback for unknown roles or errors
            return '/';
    }
}
