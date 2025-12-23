"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { RecordCard } from "@/components/features/RecordCard";
import { CriticalSummary } from "@/components/features/CriticalSummary";
import { UploadZone } from "@/components/features/UploadZone";
import { EmergencyQR } from "@/components/features/EmergencyQR";
import { WalletConnect } from "@/components/features/WalletConnect";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Trash2,
    Activity,
    Search,
    Bell,
    LogOut,
    User,
    FileClock,
    Shield,
    LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Dashboard() {
    const { records } = useAppStore();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Sticky Header */}
            <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary animate-pulse" />
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            HealthChain
                        </h1>
                        <div className="hidden md:flex ml-6 h-6 w-[1px] bg-white/10"></div>
                        <nav className="hidden md:flex items-center gap-4 ml-2">
                            <Link href="/dashboard" className="text-sm font-medium text-primary cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10">
                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                            <Link href="/emergency" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5">
                                <Shield className="h-4 w-4" /> Emergency
                            </Link>
                        </nav>
                    </div>

                    {/* Center Heartbeat Line (Desktop) */}
                    <div className="hidden lg:block w-32 h-8 opacity-50">
                        <svg viewBox="0 0 100 20" className="w-full h-full">
                            <motion.path
                                d="M0 10 H30 L35 2 L45 18 L50 10 H100"
                                fill="none"
                                stroke="#00BFFF"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                        </svg>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Search records..." className="w-64 pl-9 bg-secondary/50 border-white/10 focus:border-primary/50" />
                        </div>
                        <Button size="icon" variant="ghost" className="relative text-muted-foreground hover:text-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        </Button>
                        <WalletConnect />
                    </div>
                </div>
            </header>

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
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FileClock className="h-5 w-5 text-primary" /> Medical Records
                                </h2>

                                <Tabs defaultValue="all" className="w-auto">
                                    <TabsList className="bg-secondary/50">
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="labs">Labs</TabsTrigger>
                                        <TabsTrigger value="imaging">Imaging</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Upload Zone */}
                            <div className="mb-8">
                                <UploadZone />
                            </div>

                            {/* Records Grid */}
                            {records.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <p className="text-muted-foreground">No records found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {records.map((record, index) => (
                                        <RecordCard key={record.id} record={record} index={index} />
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
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-orange-400" /> Linked Providers
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { name: "City General Hospital", access: "Emergency", status: "Active" },
                                    { name: "Dr. Sarah Smith", access: "Read", status: "Active" },
                                ].map((provider, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className="group"
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
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-indigo-300">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-white">
                                    <User className="mr-2 h-4 w-4" /> Update Profile
                                </Button>
                                <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 hover:text-white">
                                    <FileClock className="mr-2 h-4 w-4" /> View Audit Trail
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>

            <footer className="py-6 border-t border-white/5 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Lock className="h-3 w-3" /> Data Encrypted & Patient-Owned • Built on Polygon
                </p>
            </footer>
        </div>
    );
}

// Icon helper
function Lock({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    )
}
