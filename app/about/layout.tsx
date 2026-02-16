import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us — Our Mission & Vision',
    description: 'Learn about HealthChain\'s mission to revolutionize healthcare data management. We empower patients with secure, blockchain-powered medical records that travel with them globally.',
    keywords: ['about healthchain', 'health mission', 'healthcare innovation', 'patient empowerment', 'blockchain health records', 'medical data privacy', 'health technology company'],
    openGraph: {
        title: 'About HealthChain — Empowering Patients, Transforming Healthcare',
        description: 'HealthChain is revolutionizing how medical records are stored, shared, and accessed — putting patients in control of their health data.',
    },
    alternates: {
        canonical: '/about',
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
