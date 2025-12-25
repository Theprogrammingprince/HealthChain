"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAppStore } from "@/lib/store";
import { useHealthRecords } from "@/components/hooks/useHealthRecords";
import { RecordCard } from "@/components/features/RecordCard";
import { CriticalSummary } from "@/components/features/CriticalSummary";
import { UploadZone } from "@/components/features/UploadZone";
import { EmergencyQR } from "@/components/features/EmergencyQR";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Trash2,
    FileClock,
    Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { AddProviderDialog } from "@/components/features/AddProviderDialog";
import { ProfileDialog } from "@/components/features/ProfileDialog";
import { toast } from "sonner";
import { useAccount } from "wagmi";


export default function Dashboard() {
    const { records, isLoadingRecords } = useHealthRecords();
    const { address } = useAccount();
    const [activeTab, setActiveTab] = useState("all");

    interface Provider {
        name: string;
        address: string;
        access: string;
        status: string;
    }

    // Local state for providers (persisted in session for demo purposes)
    const [providers, setProviders] = useState<Provider[]>([
        { name: "City General Hospital", address: "0x71C...9A2", access: "Emergency", status: "Active" },
        { name: "Dr. Sarah Smith", address: "0xA42...B12", access: "Read", status: "Active" },
    ]);

    const handleProviderAdded = (newProvider: Provider) => {
        setProviders(prev => [...prev, newProvider]);
    };

    const handleRemoveProvider = (index: number) => {
        const newProviders = [...providers];
        newProviders.splice(index, 1);
        setProviders(newProviders);
        toast.success("Access Revoked", { description: "Provider's access has been removed." });
    };

    const filteredRecords = records?.filter((record: { recordType?: string }) => {
        if (activeTab === "all") return true;
        return record.recordType?.toLowerCase() === activeTab.toLowerCase();
    });

    const openExplorer = () => {
        if (address) {
            window.open(`https://amoy.polygonscan.com/address/${address}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Main Dashboard Content */}
            <main className="flex-1 container py-8 space-y-8 px-4">

                {/* Critical Stats Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <CriticalSummary />
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Records & Upload */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FileClock className="h-5 w-5 text-primary" /> Medical Records
                                </h2>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                                    <TabsList className="bg-secondary/50">
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="Lab">Labs</TabsTrigger>
                                        <TabsTrigger value="Image">Imaging</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Upload Zone */}
                            <div className="mb-8">
                                <UploadZone />
                            </div>

                            {/* Records Grid */}
                            {isLoadingRecords ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground animate-pulse">Loading records from blockchain...</p>
                                </div>
                            ) : (!filteredRecords || filteredRecords.length === 0) ? (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <p className="text-muted-foreground">No {activeTab !== 'all' ? activeTab : ''} records found on-chain.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredRecords.map((record: { id: string; name: string; type: string; date: string; ipfsHash: string; recordType?: string }, index: number) => (
                                        <RecordCard key={index} record={record} index={index} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Emergency & Providers */}
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-500" /> Emergency Access
                            </h2>
                            <EmergencyQR />
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-orange-400" /> Linked Providers
                                </h2>
                                <AddProviderDialog onProviderAdded={handleProviderAdded} />
                            </div>

                            <div className="space-y-3">
                                {providers.map((provider, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className="group"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card className="bg-card/50 border-white/5 group-hover:border-primary/30 transition-colors">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm">{provider.name}</h4>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                            {provider.access} Access
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => handleRemoveProvider(i)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                                {providers.length === 0 && (
                                    <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                                        <p className="text-sm text-muted-foreground">No providers linked yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-indigo-300">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <ProfileDialog />
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-white"
                                    onClick={openExplorer}
                                >
                                    <FileClock className="mr-2 h-4 w-4" /> View Audit Trail (PolygonScan)
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}

// Icon helper

