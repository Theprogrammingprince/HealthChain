import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Contact the HealthChain team for enterprise integration, patient support, or partnership inquiries. Reach us by email, phone, or our online contact form.',
    keywords: ['contact healthchain', 'health support contact', 'healthcare platform contact', 'medical records inquiry', 'enterprise health integration'],
    openGraph: {
        title: 'Contact HealthChain — Get in Touch',
        description: 'Have questions about enterprise integration or need patient support? We\'re here to help.',
    },
    alternates: {
        canonical: '/contact',
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
