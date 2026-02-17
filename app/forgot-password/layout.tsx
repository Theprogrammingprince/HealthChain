import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password — Reset Your Account',
    description: 'Reset your HealthChain account password. Enter your email address and we\'ll send you a secure link to create a new password and regain access to your health records.',
    keywords: ['healthchain password reset', 'forgot health account password', 'reset medical records password'],
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: '/forgot-password',
    },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return children;
}
