import { Book, Code, Terminal } from "lucide-react";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Sidebar */}
                <div className="hidden md:block border-r border-white/10 pr-6">
                    <h3 className="font-semibold mb-4 text-blue-400">Getting Started</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="text-white">Introduction</li>
                        <li className="hover:text-white cursor-pointer">Architecture</li>
                        <li className="hover:text-white cursor-pointer">Smart Contracts</li>
                        <li className="hover:text-white cursor-pointer">Frontend SDK</li>
                    </ul>
                    <h3 className="font-semibold mt-8 mb-4 text-blue-400">API Reference</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="hover:text-white cursor-pointer">Record Storage</li>
                        <li className="hover:text-white cursor-pointer">Access Control</li>
                        <li className="hover:text-white cursor-pointer">Querying Data</li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Book className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold">Documentation</h1>
                    </div>

                    <p className="text-xl text-gray-400 mb-12">
                        Learn how to integrate with HealthChain or build data-rich applications on top of our protocol.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                            <Terminal className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-2">Quick Start</h3>
                            <p className="text-gray-400 text-sm">Deploy your first contract interaction in minutes.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                            <Code className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-2">SDK Reference</h3>
                            <p className="text-gray-400 text-sm">Detailed guide for our JS/TS Client SDK.</p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">Architecture</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            HealthChain uses a hybrid storage model. Large medical files (X-rays, MRIs) are encrypted and stored on IPFS/Filecoin. The content hash (CID) and access control logic are stored on the Polygon POS chain for low fees and high throughput.
                        </p>
                        <div className="p-4 rounded-lg bg-gray-900 border border-white/10 font-mono text-sm text-gray-300">
                            npm install @healthchain/sdk
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
