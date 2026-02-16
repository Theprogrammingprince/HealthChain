import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In — Access Your Health Records',
    description: 'Sign in to your HealthChain account to access your secure medical records, manage permissions, and stay connected with your healthcare providers.',
    keywords: ['healthchain login', 'sign in health records', 'access medical records', 'patient portal login', 'doctor login'],
    openGraph: {
        title: 'Sign In to HealthChain',
        description: 'Access your secure health records and manage your medical data.',
    },
    alternates: {
        canonical: '/signin',
    },
};

export default function SigninLayout({ children }: { children: React.ReactNode }) {
    return children;
}
