"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, FileText, Lock, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HospitalVerificationTable from "@/components/admin/HospitalVerificationTable";
import PaymasterMonitor from "@/components/admin/PaymasterMonitor";
import AuditLogs from "@/components/admin/AuditLogs";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("verification");

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6"
                >
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ShieldCheck className="text-[#00BFFF] h-8 w-8" />
                            The Registry <span className="text-gray-500 text-lg font-normal">| Governance Dashboard</span>
                        </h1>
                        <p className="text-gray-400 mt-2 max-w-2xl">
                            Manage the "Circle of Trust" for Health Chain. Verify hospitals, monitor gas usage, and audit security events.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                        <div className="bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-sm border border-[#10B981]/20 flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                            System Operational
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Stats (Summary) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Users className="text-[#00BFFF]" />} label="Active Hospitals" value="12" subtext="+2 pending" />
                    <StatCard icon={<Activity className="text-[#FF5252]" />} label="Paymaster Balance" value="145 MATIC" subtext="Healthy" />
                    <StatCard icon={<Lock className="text-[#10B981]" />} label="Security Score" value="98%" subtext="Last audit: Today" />
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="verification" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-900 border border-gray-800 p-1">
                        <TabsTrigger value="verification" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-white">Hospital Verification</TabsTrigger>
                        <TabsTrigger value="paymaster" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-white">Paymaster & Gas</TabsTrigger>
                        <TabsTrigger value="logs" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-white">Audit Logs</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="verification" className="space-y-4 outline-none">
                            <HospitalVerificationTable />
                        </TabsContent>

                        <TabsContent value="paymaster" className="space-y-4 outline-none">
                            <PaymasterMonitor />
                        </TabsContent>

                        <TabsContent value="logs" className="space-y-4 outline-none">
                            <AuditLogs />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext: string }) {
    return (
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-[#00BFFF]/50 transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300">{label}</CardTitle>
                <div className="p-2 bg-gray-800 rounded-md group-hover:bg-[#00BFFF]/10 transition-colors">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-gray-500 mt-1">{subtext}</p>
            </CardContent>
        </Card>
    )
}
