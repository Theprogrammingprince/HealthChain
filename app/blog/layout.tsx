import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog — Latest Health Technology Updates',
    description: 'Stay updated with HealthChain blog. Read about blockchain in healthcare, product updates, security deep dives, and the future of patient-owned medical records.',
    keywords: ['health blog', 'healthcare blockchain', 'medical records blog', 'health technology news', 'healthchain updates', 'digital health articles', 'EHR innovation'],
    openGraph: {
        title: 'HealthChain Blog — Healthcare Technology Insights',
        description: 'Thought leadership, product updates, and engineering insights from the HealthChain team.',
    },
    alternates: {
        canonical: '/blog',
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
