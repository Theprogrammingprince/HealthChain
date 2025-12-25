export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
                <p className="text-gray-400 mb-6">Last updated: December 25, 2025</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
                    <p className="text-gray-400">
                        By accessing and using HealthChain, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">2. Non-Custodial Service</h2>
                    <p className="text-gray-400">
                        You acknowledge that HealthChain is a non-custodial interface. You are solely responsible for managing your private keys and wallet access. We cannot recover access to your account if you lose your credentials.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">3. Medical Disclaimer</h2>
                    <p className="text-gray-400">
                        HealthChain is a data storage and sharing platform. We do not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">4. Blockchain Risks</h2>
                    <p className="text-gray-400">
                        You understand the inherent risks associated with blockchain technology, including but not limited to network congestion, gas fees, and smart contract vulnerabilities.
                    </p>
                </section>
            </div>
        </div>
    );
}
