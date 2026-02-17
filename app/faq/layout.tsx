import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ — Frequently Asked Questions',
    description: 'Find answers to common questions about HealthChain. Learn about data security, HIPAA compliance, access control, blockchain storage, and how to get started with your health records.',
    keywords: ['healthchain FAQ', 'health records questions', 'medical data security FAQ', 'HIPAA compliance questions', 'blockchain health FAQ', 'patient data privacy'],
    openGraph: {
        title: 'HealthChain FAQ — Your Questions Answered',
        description: 'Everything you need to know about HealthChain — data security, access control, HIPAA compliance, and more.',
    },
    alternates: {
        canonical: '/faq',
    },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return children;
}
