import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up — Create Your Health Account',
    description: 'Create your free HealthChain account. Securely store and manage your medical records, grant access to doctors, and have your health data available anywhere in the world.',
    keywords: ['healthchain signup', 'create health account', 'register medical records', 'health platform registration', 'patient account signup', 'doctor registration'],
    openGraph: {
        title: 'Sign Up for HealthChain — Start Managing Your Health Records',
        description: 'Create your free account and start managing your health records securely.',
    },
    alternates: {
        canonical: '/signup',
    },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
