export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
                <p className="text-gray-400 mb-6">Last updated: December 25, 2025</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
                    <p className="text-gray-400">
                        HealthChain ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by HealthChain.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">2. Decentralized Data</h2>
                    <p className="text-gray-400">
                        Unlike traditional platforms, HealthChain does not store your medical records on centralized servers. Your records are encrypted and stored on IPFS, with references stored on the Polygon blockchain. <strong>We cannot access your decrypted medical data.</strong> Only you hold the decryption keys.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">3. Information We Collect</h2>
                    <ul className="list-disc pl-5 text-gray-400 space-y-2">
                        <li><strong>Public Feedback:</strong> Wallet addresses used to interact with the smart contract are public on the blockchain.</li>
                        <li><strong>Voluntary Info:</strong> If you contact support, we may collect your email to respond.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">4. Transaction Data</h2>
                    <p className="text-gray-400">
                        Transactions on the blockchain are public. While the content of your records is encrypted, the timing and sender/receiver of data access grants are visible on-chain.
                    </p>
                </section>
            </div>
        </div>
    );
}
