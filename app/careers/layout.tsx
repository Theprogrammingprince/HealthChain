import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers — Join Our Team',
    description: 'Join the HealthChain team and help rebuild the healthcare infrastructure. We\'re hiring smart contract engineers, full stack developers, and product designers.',
    keywords: ['healthchain careers', 'health tech jobs', 'blockchain developer jobs', 'healthcare startup jobs', 'remote engineering jobs', 'web3 health careers'],
    openGraph: {
        title: 'Careers at HealthChain — Build the Future of Healthcare',
        description: 'Help us rebuild the healthcare infrastructure. View open positions in engineering, design, and more.',
    },
    alternates: {
        canonical: '/careers',
    },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
