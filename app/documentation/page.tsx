'use client';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, FileText, Code, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24">
            <div className="flex">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-64 border-r border-white/10 h-[calc(100vh-6rem)] sticky top-24 hidden md:block bg-black/50 backdrop-blur-xl"
                >
                    <ScrollArea className="h-full py-6 px-4">
                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-2 text-sm font-semibold tracking-wider text-blue-400 uppercase">Getting Started</h4>
                                <nav className="flex flex-col space-y-1">
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Introduction</Button>
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Installation</Button>
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Quick Start</Button>
                                </nav>
                            </div>
                            <div>
                                <h4 className="mb-2 text-sm font-semibold tracking-wider text-green-400 uppercase">Core Concepts</h4>
                                <nav className="flex flex-col space-y-1">
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Encryption</Button>
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">IPFS Storage</Button>
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Access Control</Button>
                                </nav>
                            </div>
                            <div>
                                <h4 className="mb-2 text-sm font-semibold tracking-wider text-purple-400 uppercase">API Reference</h4>
                                <nav className="flex flex-col space-y-1">
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Smart Contracts</Button>
                                    <Button variant="ghost" className="justify-start text-gray-400 hover:text-white">Frontend Hooks</Button>
                                </nav>
                            </div>
                        </div>
                    </ScrollArea>
                </motion.div>

                {/* Content */}
                <main className="flex-1 py-10 px-8 md:px-12 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 text-blue-400 mb-4">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">Documentation</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Introduction to HealthChain</h1>
                        <p className="text-xl text-gray-400 leading-relaxed mb-12">
                            HealthChain is a decentralized medical record system built on Polygon. It allows patients to own their data and grant granular access to providers.
                        </p>

                        <div className="space-y-12">
                            <section id="architecture">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Settings className="w-6 h-6 text-gray-500" />
                                    Architecture
                                </h2>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 leading-relaxed text-gray-300">
                                    <p className="mb-4">
                                        The system consists of three main pillars:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li><strong className="text-white">Smart Contracts:</strong> Handle access control and record hashes on Polygon Amoy.</li>
                                        <li><strong className="text-white">IPFS (Pinata):</strong> Decentralized storage for encrypted medical files (PDFs, Images).</li>
                                        <li><strong className="text-white">Frontend (Next.js):</strong> User interface for encryption, decryption, and viewing.</li>
                                    </ul>
                                </div>
                            </section>

                            <section id="smart-contracts">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Code className="w-6 h-6 text-gray-500" />
                                    Smart Contracts
                                </h2>
                                <p className="text-gray-400 mb-6">
                                    Our primary contract <code className="bg-white/10 px-1 py-0.5 rounded text-blue-300">HealthChainRecords.sol</code> manages the mapping between patients and their record hashes.
                                </p>
                                <div className="bg-black border border-white/10 rounded-xl p-6 overflow-x-auto">
                                    <pre className="text-sm text-green-400 font-mono">
                                        {`function addRecord(string memory _ipfsHash, string memory _recordType) public {
    // Adds a record to the caller's history
    records[msg.sender].push(Record(_ipfsHash, _recordType, msg.sender, block.timestamp));
    emit RecordAdded(msg.sender, _ipfsHash, _recordType);
}`}
                                    </pre>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
