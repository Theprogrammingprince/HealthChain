'use client';
import { ScrollText } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gray-800 rounded-lg">
                        <ScrollText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-4xl font-bold">Terms of Service</h1>
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-gray-400 mb-8">
                        By using HealthChain, you acknowledge that you are interacting with a decentralized protocol running on the Polygon blockchain.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">1. No Liability</h2>
                        <p className="text-gray-400">
                            HealthChain is a software interface. We are not responsible for any loss of keys, failed transactions due to blockchain congestion, or medical malpractice resulting from data usage.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">2. Immutable Actions</h2>
                        <p className="text-gray-400">
                            Transactions on the blockchain are irreversible. Please verify all wallet addresses before granting access to your medical records.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-white">3. Beta Software</h2>
                        <p className="text-gray-400">
                            HealthChain is currently in Beta (Testnet). Do not store critical, life-altering data without a backup. The "Amoy" network is for testing purposes only.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
