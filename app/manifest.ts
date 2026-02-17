import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'HealthChain — Secure Health Records Platform',
        short_name: 'HealthChain',
        description: 'Patient-owned health records platform with blockchain-powered security and emergency medical access.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#2563eb',
        orientation: 'portrait-primary',
        categories: ['health', 'medical', 'productivity'],
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
