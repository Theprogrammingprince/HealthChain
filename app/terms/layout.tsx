import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'HealthChain Terms of Service. Understand the terms of using our decentralized health records platform, including liability, immutable actions, and beta considerations.',
    keywords: ['healthchain terms', 'health platform terms of service', 'blockchain health terms', 'medical records terms'],
    openGraph: {
        title: 'HealthChain Terms of Service',
        description: 'Terms and conditions for using the HealthChain platform.',
    },
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
