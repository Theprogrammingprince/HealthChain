'use client';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Code, Settings, ChevronRight, Search, Book, Shield, Cpu, Database, Network } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

const sidebarData = [
    {
        title: "Getting Started",
        icon: Book,
        color: "text-blue-400",
        items: ["Introduction", "Installation", "Network Config", "Quick Start"]
    },
    {
        title: "Protocol Core",
        icon: Cpu,
        color: "text-emerald-400",
        items: ["Guardian Encryption", "IPFS Architecture", "Access Control List", "Identity Layer"]
    },
    {
        title: "API Reference",
        icon: Code,
        color: "text-purple-400",
        items: ["Smart Contracts", "REST API", "GraphQL Interface", "Webhooks"]
    },
    {
        title: "Deployment",
        icon: Network,
        color: "text-amber-400",
        items: ["Production Nodes", "Security Audit", "Compliance", "Observability"]
    }
];

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Header / Search Area */}
            <div className="pt-32 pb-10 border-b border-white/5 relative overflow-hidden bg-zinc-950/50 backdrop-blur-3xl sticky top-0 z-50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <h1 className="text-xl font-black tracking-widest uppercase">Protocol Docs</h1>
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-gray-500">v2.4.0</div>
                    </div>

                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search clinical protocols..."
                            className="bg-black border-white/5 h-12 pl-12 rounded-full focus:border-blue-500/50 transition-all text-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500">K</kbd>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex max-w-[1400px] mx-auto">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-72 h-[calc(100vh-10rem)] sticky top-[10rem] hidden lg:block border-r border-white/5"
                >
                    <ScrollArea className="h-full py-8 px-6">
                        <div className="space-y-10">
                            {sidebarData.map((section, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <section.icon className={`w-4 h-4 ${section.color}`} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{section.title}</h4>
                                    </div>
                                    <nav className="space-y-1">
                                        {section.items.map((item, i) => (
                                            <button
                                                key={i}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${item === "Introduction"
                                                        ? "bg-white/5 text-blue-400 border border-white/5"
                                                        : "text-gray-500 hover:text-white hover:bg-white/[0.02]"
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </motion.div>

                {/* Main Content Area */}
                <main className="flex-1 py-12 px-6 md:px-16 max-w-4xl min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-16"
                    >
                        {/* Article Header */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-xs font-black text-blue-500 uppercase tracking-widest">
                                <span>Core</span>
                                <ChevronRight className="w-3 h-3" />
                                <span>Getting Started</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                                Introduction to <br />
                                <span className="text-blue-500">HealthChain Protocol.</span>
                            </h2>
                            <p className="text-xl text-gray-500 leading-relaxed font-medium">
                                HealthChain is the foundational layer for decentralized medical records. It provides a set of cryptographically-auditable primitives for data ownership, clinical verification, and emergency access.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-3xl bg-zinc-950 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all group">
                                <div className="p-3 bg-blue-500/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Sovereign Encryption</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Patient data is never visible to the protocol. All encryption happens client-side using industry-standard AES-256.
                                </p>
                            </div>
                            <div className="p-8 rounded-3xl bg-zinc-950 border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all group">
                                <div className="p-3 bg-emerald-500/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                    <Database className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">IPFS Storage Layer</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Encrypted blobs are distributed across the InterPlanetary File System, ensuring no single point of failure or centralized control.
                                </p>
                            </div>
                        </div>

                        {/* Code Example */}
                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Code className="w-6 h-6 text-gray-600" />
                                Smart Contract Registry
                            </h3>
                            <p className="text-gray-500 font-medium">
                                The registry contract handles the state of medical records and verifies professional credentials on the Polygon network.
                            </p>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
                                    <div className="bg-zinc-900/50 px-5 py-3 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-900" />
                                            <div className="w-2 h-2 rounded-full bg-amber-900" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-900" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Registry.sol</span>
                                    </div>
                                    <div className="p-8 overflow-x-auto">
                                        <pre className="text-sm font-mono leading-relaxed">
                                            <code className="text-blue-300">{`function `}</code>
                                            <code className="text-white">{`addRecord(`}</code>
                                            <code className="text-amber-300">{`string `}</code>
                                            <code className="text-white">{`memory _ipfsHash, `}</code>
                                            <code className="text-amber-300">{`string `}</code>
                                            <code className="text-white">{`memory _type) `}</code>
                                            <code className="text-blue-300">{`public {`}</code>
                                            <br />
                                            <code className="text-gray-600">{`    // Verify clinical timestamp`}</code>
                                            <br />
                                            <code className="text-white">{`    records[msg.sender].push(Record(`}</code>
                                            <br />
                                            <code className="text-white">{`        _ipfsHash,`}</code>
                                            <br />
                                            <code className="text-white">{`        _type,`}</code>
                                            <br />
                                            <code className="text-white">{`        block.timestamp`}</code>
                                            <br />
                                            <code className="text-white">{`    ));`}</code>
                                            <br />
                                            <code className="text-blue-300">{`}`}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Integration Guide Snippet */}
                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Settings className="w-6 h-6 text-gray-600" />
                                Integration Steps
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { step: "01", title: "Generate Keys", desc: "Create your protocol keys using our client-side SDK." },
                                    { step: "02", title: "Anchor Identity", desc: "Sign the initial transaction to anchor your clinical identity." },
                                    { step: "03", title: "Sync Data", desc: "Upload legacy records to the IPFS storage provider." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-6 p-6 rounded-2xl bg-zinc-950/50 border border-white/5">
                                        <span className="text-2xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors uppercase italic font-serif leading-none mt-1">{step.step}</span>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white">{step.title}</h4>
                                            <p className="text-gray-500 text-sm">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Bottom Nav */}
                        <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                            <div className="group cursor-pointer">
                                <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest block mb-2">Previous</span>
                                <span className="font-bold text-white group-hover:text-blue-500 transition-colors">Documentation Home</span>
                            </div>
                            <div className="group cursor-pointer text-right">
                                <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest block mb-2">Next</span>
                                <span className="font-bold text-white group-hover:text-blue-500 transition-colors">Installation Guide</span>
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* On-Page Content Sidebar (Desktop only) */}
                <div className="w-64 h-[calc(100vh-10rem)] sticky top-[10rem] hidden xl:block px-8 py-12">
                    <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">On this page</h5>
                    <nav className="space-y-4">
                        {["Overview", "Core Architecture", "Record Registry", "Integration Steps"].map((nav, i) => (
                            <a key={i} href="#" className="block text-[11px] font-bold text-gray-500 hover:text-blue-400 transition-colors uppercase tracking-[0.1em]">{nav}</a>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
