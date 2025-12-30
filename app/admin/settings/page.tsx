"use client";

import { useAppStore } from "@/lib/store";
import { CheckCircle2, XCircle, Shield, Building2, Search, Filter } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AdminSettingsPage() {
    const { verificationRequests } = useAppStore();
    const [filter, setFilter] = useState<'All' | 'Verified' | 'Rejected' | 'Pending'>('All');
    const [activeTab, setActiveTab] = useState<'hospitals' | 'clinics'>('hospitals');
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequests = verificationRequests.filter(req => {
        const matchesStatus = filter === 'All' || req.status === filter;
        const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.license.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
            <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Registry Settings</h1>
                    <p className="text-gray-400">Manage hospital whitelists and verified credentials.</p>
                </div>
                <Link href="/admin" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    ← Back to Dashboard
                </Link>
            </header>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Tabs & Filters */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                        {/* Type Tabs */}
                        <div className="flex bg-black/40 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('hospitals')}
                                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'hospitals' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Hospitals
                            </button>
                            <button
                                onClick={() => setActiveTab('clinics')}
                                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'clinics' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Specialized Clinics
                            </button>
                        </div>

                        {/* Search & Status Filters */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
                                {['All', 'Verified', 'Pending', 'Rejected'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f as any)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === f
                                            ? 'bg-white/10 text-white border border-white/10'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search registry..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main List */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Entity Name</th>
                                        <th className="px-6 py-4">License ID</th>
                                        <th className="px-6 py-4">Wallet Address</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Registered On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {/* Mocking Clinic Data separately just for view if needed, or filtering existing source */}
                                    {/* For this step, we will use the same source but visually distinguish or assume data separation logic further up */}
                                    {filteredRequests.map((req) => (
                                        <tr key={req.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === 'hospitals' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                        {activeTab === 'hospitals' ? <Building2 size={20} /> : <Shield size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{req.name} {activeTab === 'clinics' && '(Clinic)'}</div>
                                                        <div className="text-[10px] text-gray-500">Type: {activeTab === 'hospitals' ? 'General Hospital' : 'Specialized Clinic'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                                                    {req.license}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                                                    {req.address}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-gray-500 font-mono">
                                                {req.timestamp}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredRequests.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    No {activeTab} found matching your filters.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Settings Sections (Placeholder for "Everything Necessary") */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="text-emerald-500" size={20} />
                            Governance Parameters
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-sm text-gray-400">Emergency Access Timeout</span>
                                <span className="font-mono font-bold">5 MINS</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-sm text-gray-400">Min. Stake Requirement</span>
                                <span className="font-mono font-bold">500 $HC</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-sm text-gray-400">Consensus Threshold</span>
                                <span className="font-mono font-bold">2/3 VALIDATORS</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">System Maintenance</h3>
                        <p className="text-sm text-gray-500 mb-6">Critical actions for network state management.</p>

                        <div className="space-y-3">
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 font-medium transition-colors text-left px-4">
                                Export Registry Data (JSON)
                            </button>
                            <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm text-red-400 font-medium transition-colors text-left px-4">
                                Pause Emergency Gateway
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Verified') return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20"><CheckCircle2 size={10} /> Verified</span>;
    if (status === 'Rejected') return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase border border-red-500/20"><XCircle size={10} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase border border-yellow-500/20">Pending</span>;
}
