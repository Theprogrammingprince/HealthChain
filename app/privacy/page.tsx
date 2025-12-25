'use client';
import { ShieldAlert, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-bold">Privacy Policy</h1>
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-gray-400 mb-8">
                        At HealthChain, privacy is not an option; it's the foundation of our architecture.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">1. Data Ownership</h2>
                        <p className="text-gray-400">
                            All data uploaded to HealthChain is encrypted client-side. The encrypted blobs are stored on IPFS. The decryption keys are held solely by you (the patient). HealthChain developers possess no "master key".
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. Blockchain Transparency</h2>
                        <p className="text-gray-400">
                            While your actual medical data is encrypted and hidden, the <em>transactions</em> (e.g., "User A granted access to Doctor B") are public on the Polygon blockchain. This ensures an immutable audit trail of who accessed your records and when.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">3. Third-Party Access</h2>
                        <p className="text-gray-400">
                            No third party can access your data unless you explicitly sign a smart contract transaction granting them permission. You may revoke this permission at any time, instantly cutting off access.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
