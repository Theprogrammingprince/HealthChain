import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://healthchain.io';

// Organization Schema
export function OrganizationJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'HealthChain',
        url: baseUrl,
        logo: `${baseUrl}/favicon.ico`,
        description: 'HealthChain is the world\'s first secure, patient-owned health records platform powered by blockchain technology.',
        foundingDate: '2025',
        sameAs: [
            'https://twitter.com/healthchain',
            'https://github.com/healthchain',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'support@healthchain.io',
            availableLanguage: ['English'],
        },
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'NG',
        },
    };

    return (
        <Script
            id="organization-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}

// WebSite Schema (enables sitelinks search box in Google)
export function WebSiteJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'HealthChain',
        url: baseUrl,
        description: 'Secure, patient-owned health records platform. Access your medical data anywhere with blockchain-powered privacy.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <Script
            id="website-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}

// WebApplication Schema
export function WebApplicationJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'HealthChain',
        url: baseUrl,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        description: 'Secure health records management platform for patients, doctors, and hospitals.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free for patients',
        },
        featureList: [
            'Secure health record storage',
            'Emergency medical data access',
            'Doctor-patient record sharing',
            'Blockchain-powered data privacy',
            'HIPAA compliant',
            'Global accessibility',
            'Hospital management dashboard',
            'Patient portal',
        ],
    };

    return (
        <Script
            id="webapp-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}

// MedicalOrganization Schema
export function MedicalOrganizationJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        name: 'HealthChain',
        url: baseUrl,
        description: 'Digital health platform providing secure, blockchain-powered medical record management and emergency health data access.',
        medicalSpecialty: 'Health Information Technology',
    };

    return (
        <Script
            id="medical-org-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}

// FAQPage Schema (for FAQ/Support pages — boosts featured snippets)
export function FAQPageJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <Script
            id="faq-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}

// BreadcrumbList Schema
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <Script
            id="breadcrumb-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}

// SoftwareApplication Schema
export function SoftwareApplicationJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'HealthChain',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        url: baseUrl,
        description: 'Patient-owned health records platform with blockchain security, emergency medical access, and hospital management.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
            bestRating: '5',
        },
    };

    return (
        <Script
            id="software-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
        />
    );
}
