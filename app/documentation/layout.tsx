import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Documentation — Developer Guide & API Reference',
    description: 'HealthChain developer documentation. Learn about our architecture, smart contracts, IPFS storage, encryption, access control, and API reference for building health applications.',
    keywords: ['healthchain docs', 'health API documentation', 'blockchain health API', 'smart contract docs', 'IPFS health storage', 'developer health platform'],
    openGraph: {
        title: 'HealthChain Documentation — Developer Guide',
        description: 'Comprehensive developer documentation for building on the HealthChain platform.',
    },
    alternates: {
        canonical: '/documentation',
    },
};

export default function DocumentationLayout({ children }: { children: React.ReactNode }) {
    return children;
}
