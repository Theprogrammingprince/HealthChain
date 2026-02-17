import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Emergency Medical Access Portal',
    description: 'Emergency medical data access for first responders. Enter a patient\'s Emergency Access Code to instantly view critical health information including allergies, blood type, and medications.',
    keywords: ['emergency health access', 'medical emergency portal', 'first responder health data', 'emergency medical records', 'critical health information', 'emergency patient data'],
    openGraph: {
        title: 'HealthChain Emergency Portal — Instant Medical Data Access',
        description: 'Emergency medical data access for first responders. Authorized personnel only.',
    },
    alternates: {
        canonical: '/emergency',
    },
};

export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
