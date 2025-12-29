"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, ShieldAlert, ArrowRight, Activity, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export function PatientSearchBar() {
    const [query, setQuery] = useState("");
    const { patients } = useAppStore();
    const searchParams = useSearchParams();
    const [results, setResults] = useState(patients);

    useEffect(() => {
        // Detect emergency link via URL (simulated)
        const emergencyId = searchParams.get('emergency');
        if (emergencyId) {
            const patient = patients.find(p => p.id === emergencyId);
            if (patient) {
                setQuery(patient.id);
                setResults([patient]);
            }
        }
    }, [searchParams, patients]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (!val) {
            setResults(patients);
            return;
        }
        const filtered = patients.filter(p =>
            p.id.toLowerCase().includes(val.toLowerCase()) ||
            p.name.toLowerCase().includes(val.toLowerCase()) ||
            p.walletAddress.toLowerCase().includes(val.toLowerCase())
        );
        setResults(filtered);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input
                        placeholder="Search Patient by Unique ID, Name, or Wallet address (0x...)"
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-[#00BFFF]/50"
                        value={query}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-14 px-6 border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                    <Button className="h-14 px-6 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold rounded-2xl">
                        <UserPlus className="mr-2 h-5 w-5" /> Admit New
                    </Button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-gray-400 pl-8">Patient Identity</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Unique ID</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Role Status</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Last Encounter</TableHead>
                            <TableHead className="text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {results.map((patient) => (
                                <motion.tr
                                    key={patient.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group hover:bg-white/5 transition-colors border-white/5"
                                >
                                    <TableCell className="pl-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#00BFFF]/10 rounded-xl flex items-center justify-center border border-[#00BFFF]/20">
                                                <span className="text-sm font-bold text-[#00BFFF]">{patient.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{patient.name} <span className="text-gray-600 font-normal ml-2">({patient.dob})</span></p>
                                                <p className="text-[10px] text-gray-500 font-mono tracking-tighter">{patient.walletAddress}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono bg-white/5 border-white/10 text-gray-400">
                                            {patient.id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">CONSENT ACTIVE</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-xs">
                                        {patient.lastVisit}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Button variant="ghost" className="text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded-xl font-bold p-2 px-4 flex items-center gap-2 ml-auto group/btn">
                                            Open Record
                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>

                        {results.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-600">
                                        <Activity className="w-12 h-12 mb-4 opacity-20 grayscale" />
                                        <p className="text-sm font-bold uppercase tracking-widest mb-1">No Clinical Records Found</p>
                                        <p className="text-xs italic">Verify the patient ID or check the emergency link.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {searchParams.get('emergency') && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-500">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-100 uppercase tracking-wide">Emergency Referral Detected</p>
                            <p className="text-[10px] text-red-500/60 leading-tight">THE PATIENT HAS SHARED A ONE-TIME EMERGENCY ACCESS CHANNEL.</p>
                        </div>
                    </div>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg h-10 px-6">
                        Execute Break-Glass Access
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
