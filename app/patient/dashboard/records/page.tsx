"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, FileText, Heart, Plus, Scale, Thermometer, User, Edit2 } from "lucide-react";
import { ProfileSetupDialog } from "@/components/dashboard/ProfileSetupDialog";
import { RecordCard } from "@/components/dashboard/RecordCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadDialog } from "@/components/dashboard/DocumentUploadDialog";
import { UserNav } from "@/components/dashboard/UserNav"; // Assuming we extract this later or just mock header for now
import { useRouter } from "next/navigation";

export default function RecordsPage() {
    const { userVitals, records, fetchUserProfile } = useAppStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00BFFF]/30 pb-20">
            {/* Header - Duplicate for now to ensure consistency */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/60 backdrop-blur-2xl">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/patient/dashboard')}>
                            <div className="w-10 h-10 bg-[#00BFFF]/20 rounded-xl flex items-center justify-center border border-[#00BFFF]/20 group-hover:bg-[#00BFFF]/30 transition-all">
                                <Activity className="w-6 h-6 text-[#00BFFF]" />
                            </div>
                            <div>
                                <span className="text-xl font-black tracking-tighter uppercase block leading-none">HealthChain</span>
                                <span className="text-[10px] font-bold text-[#00BFFF] uppercase tracking-[0.2em]">Records</span>
                            </div>
                        </div>
                    </div>
                    {/* We might want a back button or nav here */}
                    <Button variant="ghost" onClick={() => router.push('/patient/dashboard')} className="text-sm font-bold uppercase tracking-widest text-[#00BFFF]">
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    {/* Title Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Detailed Records</h1>
                            <p className="text-gray-400 font-medium">Manage your clinical vitals and history</p>
                        </div>
                        <Button
                            onClick={() => setIsEditOpen(true)}
                            className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-black uppercase tracking-widest rounded-xl h-12 px-8"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Update Vitals
                        </Button>
                    </div>

                    {/* Vitals Grid */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-[#00BFFF]" /> Physical
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Weight</span>
                                        <span className="text-2xl font-black">{userVitals.weight} <span className="text-sm text-gray-500 font-bold">kg</span></span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Height</span>
                                        <span className="text-2xl font-black">{userVitals.height} <span className="text-sm text-gray-500 font-bold">cm</span></span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 text-xs font-bold uppercase">BMI</span>
                                        <span className="text-xl font-black text-[#00BFFF]">
                                            {userVitals.weight && userVitals.height
                                                ? (userVitals.weight / ((userVitals.height / 100) ** 2)).toFixed(1)
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-red-500" /> Cardiovascular
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Blood Pressure</span>
                                        <span className="text-xl font-black">{userVitals.bloodPressure || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Blood Type</span>
                                        <span className="text-2xl font-black text-red-400">{userVitals.bloodType}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-400 text-xs font-bold uppercase">Genotype</span>
                                        <span className="text-2xl font-black">{userVitals.genotype}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden col-span-1 md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" /> Clinical History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-3">Allergies</span>
                                    <div className="flex flex-wrap gap-2">
                                        {userVitals.allergies?.length > 0 ? userVitals.allergies.map((a, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                {a}
                                            </span>
                                        )) : <span className="text-gray-600 italic text-sm">None recorded</span>}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-3">Chronic Conditions</span>
                                    <div className="flex flex-wrap gap-2">
                                        {userVitals.conditions?.length > 0 ? userVitals.conditions.map((c, i) => (
                                            <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                {c}
                                            </span>
                                        )) : <span className="text-gray-600 italic text-sm">None recorded</span>}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-3">Active Medications</span>
                                    <div className="flex flex-wrap gap-2">
                                        {userVitals.medications?.length > 0 ? userVitals.medications.map((m, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                {m}
                                            </span>
                                        )) : <span className="text-gray-600 italic text-sm">None recorded</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.section>

                    {/* Documents Section */}
                    <motion.section variants={itemVariants}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FileText className="text-[#00BFFF] w-6 h-6" />
                                Medical Documents
                            </h2>
                            <DocumentUploadDialog />
                        </div>

                        <Tabs defaultValue="Laboratory" className="w-full">
                            <TabsList className="bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
                                {['Laboratory', 'Radiology', 'Pharmacy', 'General'].map(cat => (
                                    <TabsTrigger
                                        key={cat}
                                        value={cat}
                                        className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black rounded-lg transition-all font-bold px-6"
                                    >
                                        {cat}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {['Laboratory', 'Radiology', 'Pharmacy', 'General'].map(cat => (
                                <TabsContent key={cat} value={cat} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {records.filter(r => r.category === cat).map(record => (
                                            <RecordCard key={record.id} record={record} />
                                        ))}
                                    </div>
                                    {records.filter(r => r.category === cat).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white/2 border border-dashed border-white/10 rounded-3xl">
                                            <Plus className="w-12 h-12 text-gray-700 mb-4" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No {cat} Records</p>
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </motion.section>
                </motion.div>

                <ProfileSetupDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
            </main>
        </div>
    );
}
