import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partners — Join the HealthChain Network',
    description: 'Partner with HealthChain to revolutionize healthcare access. Hospitals, clinics, pharmacies, and health tech vendors can join our blockchain-powered health records network.',
    keywords: ['healthchain partners', 'healthcare partnership', 'hospital integration', 'health tech partnership', 'medical records API', 'clinical integration partner'],
    openGraph: {
        title: 'HealthChain Partner Program — Collaborate With Us',
        description: 'Join the HealthChain network. Collaborate with us to build the future of patient data.',
    },
    alternates: {
        canonical: '/partners',
    },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
