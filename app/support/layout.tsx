import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support & Help Center',
    description: 'Get help with HealthChain. Browse FAQs about medical record security, emergency access, permissions management, and more. Contact our 24/7 support team.',
    keywords: ['healthchain support', 'health records help', 'medical data FAQ', 'emergency access help', 'patient portal support', 'healthcare support'],
    openGraph: {
        title: 'HealthChain Support — Help Center & FAQs',
        description: 'Find answers to common questions about HealthChain and get support from our dedicated team.',
    },
    alternates: {
        canonical: '/support',
    },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return children;
}
