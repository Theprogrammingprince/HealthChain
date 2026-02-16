import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://healthchain.io';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/patient/dashboard/',
                    '/clinical/',
                    '/doctor/',
                    '/auth/callback',
                    '/reset-password',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
