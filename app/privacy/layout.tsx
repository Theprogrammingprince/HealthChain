import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'HealthChain Privacy Policy. Learn how we protect your health data with client-side encryption, blockchain transparency, and patient-controlled access. Your data, your ownership.',
    keywords: ['healthchain privacy', 'health data privacy', 'medical records privacy policy', 'HIPAA privacy', 'patient data protection', 'blockchain privacy'],
    openGraph: {
        title: 'HealthChain Privacy Policy',
        description: 'Learn how HealthChain protects your health data with encryption and blockchain technology.',
    },
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
