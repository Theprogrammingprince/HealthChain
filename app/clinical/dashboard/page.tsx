"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Stethoscope,
    AlertTriangle,
    User,
    LogOut,
    Bell,
    Settings,
    ArrowRight,
    Lock,
    Plus,
    LifeBuoy
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { PatientSearchBar } from "@/components/dashboard/PatientSearchBar";
import { BreakGlassDialog } from "@/components/dashboard/BreakGlassDialog";
import { RecordEntryForm } from "@/components/dashboard/RecordEntryForm";
import { StaffManagementTable } from "@/components/dashboard/StaffManagementTable";
import { VitalsTimeline } from "@/components/dashboard/VitalsTimeline";
import { ActivityLogTable } from "@/components/dashboard/ActivityLogTable";
import { DoctorSubmissionTable } from "@/components/dashboard/DoctorSubmissionTable";
import { HospitalArrivalsTable } from "@/components/dashboard/HospitalArrivalsTable";
import { AccessDeniedScreen } from "@/components/dashboard/AccessDeniedScreen";
import { HospitalDashboardGuard } from "@/components/dashboard/HospitalDashboardGuard";
import { VerificationStatusBanner } from "@/components/dashboard/VerificationStatusBanner";
import { AccessCodeScanner } from "@/components/dashboard/AccessCodeScanner";
import { useRegistry } from "@/hooks/useRegistry";
import { RequireAuth } from "@/components/features/RequireAuth";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function ClinicalDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { walletAddress, currentStaff, disconnectWallet, authenticateUser, isAuthorized, checkAuthorization, supabaseSession } = useAppStore();
    const { checkHospitalStatus } = useRegistry();
    const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected" | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("patients");
    const { setActivePatient } = useAppStore();

    useEffect(() => {
        const verifyHospital = async () => {
            if (walletAddress) {
                const authorized = await checkHospitalStatus(walletAddress);
                checkAuthorization(authorized);
            }
        };
        verifyHospital();
    }, [walletAddress, checkHospitalStatus, checkAuthorization]);

    // Load hospital verification status
    useEffect(() => {
        const loadVerificationStatus = async () => {
            const userId = supabaseSession?.user?.id || walletAddress;

            if (!userId) return;

            try {
                const { data, error } = await supabase
                    .from("hospital_profiles")
                    .select("verification_status, rejection_reason")
                    .eq("user_id", userId)
                    .single();

                if (data) {
                    setVerificationStatus(data.verification_status);
                    setRejectionReason(data.rejection_reason || null);
                }
            } catch (error) {
                console.error("Error loading verification status:", error);
            }
        };

        loadVerificationStatus();
    }, [supabaseSession, walletAddress]);

    useEffect(() => {
        // Default to admin for demo if not set
        if (!currentStaff) {
            authenticateUser('Admin');
        }
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [currentStaff, authenticateUser]);

    const handleLogout = () => {
        disconnectWallet();
        router.push("/");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (!isAuthorized && walletAddress) {
        const isRevoked = walletAddress.toLowerCase().includes("revoked");
        return (
            <AccessDeniedScreen
                reason={isRevoked ? 'revoked' : 'unauthorized'}
                walletAddress={walletAddress}
                onDisconnect={handleLogout}
            />
        );
    }

    return (
        <RequireAuth requiredRole="Hospital">
            <HospitalDashboardGuard allowedForUnverified={false}>
                <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00BFFF]/30">
                    {/* Clinical Grid Overlay */}
                    <div className="fixed inset-0 pointer-events-none opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    {/* Clinical Header */}
                    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/60 backdrop-blur-2xl">
                        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                                        <Stethoscope className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <span className="text-xl font-black tracking-tighter uppercase block leading-none">HealthChain</span>
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Clinical View v1.0</span>
                                    </div>
                                </div>

                                <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full ml-10">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mayo Clinic - Central Node</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Verification Status Banner */}
                                {verificationStatus && (
                                    <div className="hidden xl:block">
                                        <VerificationStatusBanner
                                            status={verificationStatus}
                                            rejectionReason={rejectionReason}
                                        />
                                    </div>
                                )}

                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-sm font-bold text-white">{currentStaff?.name || 'Dr. Gregory House'}</span>
                                    <Badge className="bg-[#00BFFF]/10 text-[#00BFFF] border-none text-[9px] uppercase font-black px-2 mt-0.5">
                                        {currentStaff?.role === 'Admin' ? 'HOSPITAL ADMINISTRATOR' : 'ATTENDING PHYSICIAN'}
                                    </Badge>
                                </div>

                                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                                    <Bell className="w-4 h-4 text-gray-400" />
                                </button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="cursor-pointer border-2 border-white/5 hover:border-indigo-500/50 transition-all w-10 h-10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStaff?.name || 'Gregory'}`} />
                                            <AvatarFallback className="bg-white/5"><User /></AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white w-56 p-2 rounded-2xl shadow-2xl">
                                        <DropdownMenuLabel className="px-3 py-1 flex flex-col">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Clinical Session</span>
                                            <span className="font-bold text-sm">Authenticated</span>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem
                                            className="focus:bg-white/5 cursor-pointer rounded-xl p-3"
                                            onClick={() => router.push('/clinical/settings')}
                                        >
                                            <Settings className="w-4 h-4 mr-2" /> Hospital Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="focus:bg-white/5 cursor-pointer rounded-xl p-3"
                                            onClick={() => router.push('/support')}
                                        >
                                            <LifeBuoy className="w-4 h-4 mr-2" /> Protocol Support
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem className="focus:bg-red-500/10 cursor-pointer rounded-xl p-3 text-red-500" onClick={handleLogout}>
                                            <LogOut className="w-4 h-4 mr-2" /> End Shift
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Mobile Verification Status Banner */}
                        {verificationStatus && (
                            <div className="xl:hidden border-t border-white/5 px-6 py-3">
                                <VerificationStatusBanner
                                    status={verificationStatus}
                                    rejectionReason={rejectionReason}
                                />
                            </div>
                        )}
                    </header>

                    <main className="max-w-[1600px] mx-auto px-6 py-10 relative z-10">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-10"
                        >
                            {/* Header Actions */}
                            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Point of Care</h1>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Provider Intelligence & Data Exchange</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AccessCodeScanner />
                                    <BreakGlassDialog />
                                    <button className="h-14 px-8 border border-[#00BFFF]/20 bg-[#00BFFF]/5 text-[#00BFFF] font-black rounded-2xl hover:bg-[#00BFFF]/10 transition-all uppercase tracking-widest text-xs">
                                        Generate Clinical Summary
                                    </button>
                                </div>
                            </motion.div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-white/5 p-1 rounded-2xl mb-10 border border-white/5 flex w-fit">
                                    <TabsTrigger value="patients" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black rounded-xl transition-all font-black px-10 py-3 uppercase text-xs tracking-widest">
                                        Patient Search
                                    </TabsTrigger>
                                    <TabsTrigger value="encounter" className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black rounded-xl transition-all font-black px-10 py-3 uppercase text-xs tracking-widest">
                                        Active Encounter
                                    </TabsTrigger>
                                    {currentStaff?.role === 'Admin' && (
                                        <TabsTrigger value="staff" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-xl transition-all font-black px-10 py-3 uppercase text-xs tracking-widest">
                                            Staff Registry
                                        </TabsTrigger>
                                    )}
                                    {currentStaff?.role === 'Admin' && (
                                        <TabsTrigger value="submissions" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl transition-all font-black px-10 py-3 uppercase text-xs tracking-widest">
                                            Doctor Submissions
                                        </TabsTrigger>
                                    )}
                                    {currentStaff?.role === 'Admin' && (
                                        <TabsTrigger value="arrivals" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-xl transition-all font-black px-10 py-3 uppercase text-xs tracking-widest">
                                            Clinical Arrivals
                                        </TabsTrigger>
                                    )}
                                </TabsList>

                                <TabsContent value="patients" className="space-y-10">
                                    <motion.section variants={itemVariants}>
                                        <Suspense fallback={<Skeleton className="w-full h-14 rounded-2xl" />}>
                                            <PatientSearchBar onPatientSelect={(id) => {
                                                setActivePatient(id);
                                                setActiveTab("encounter");
                                            }} />
                                        </Suspense>
                                    </motion.section>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <motion.section variants={itemVariants}>
                                            <ActivityLogTable />
                                        </motion.section>

                                        <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                                    <Lock className="text-indigo-400 w-5 h-5" />
                                                    Patient Consent Protocol
                                                </h3>
                                                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                                    HealthChain Clinical View enforces Zero-Knowledge access. Doctors cannot decrypt patient&apos;s records without active cryptographic consent or an audited Break-Glass event.
                                                </p>
                                            </div>

                                            <div className="pt-8 space-y-4">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-colors">
                                                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                                        <Plus size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-white uppercase">Request Bulk Export</p>
                                                        <p className="text-[10px] text-gray-600 tracking-tighter">Requires Hospital Admin Approval</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-700 group-hover:text-white" />
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-colors">
                                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                                        <ShieldCheck size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-white uppercase">Verify Signature Authenticity</p>
                                                        <p className="text-[10px] text-gray-600 tracking-tighter">Check Ledger integrity of current session</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-700 group-hover:text-white" />
                                                </div>
                                            </div>
                                        </motion.section>
                                    </div>
                                </TabsContent>

                                <TabsContent value="encounter" className="space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        <div className="lg:col-span-8 space-y-10">
                                            <motion.section variants={itemVariants}>
                                                <RecordEntryForm />
                                            </motion.section>
                                        </div>

                                        <div className="lg:col-span-4 space-y-10">
                                            <motion.section variants={itemVariants}>
                                                <VitalsTimeline />
                                            </motion.section>

                                            <motion.section variants={itemVariants} className="bg-[#FF5252]/5 border border-[#FF5252]/10 rounded-3xl p-8 space-y-4">
                                                <div className="flex items-center gap-3 text-[#FF5252]">
                                                    <AlertTriangle size={24} />
                                                    <span className="font-black uppercase tracking-[0.2rem] text-sm">Critical Clinical Alerts</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="p-4 rounded-xl bg-white/5 border-l-4 border-red-500">
                                                        <p className="text-xs font-bold text-white uppercase">Allergy Detected: Penicillin</p>
                                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Cross-reactions possible with Cephalosporins</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white/5 border-l-4 border-orange-500">
                                                        <p className="text-xs font-bold text-white uppercase">Abnormal Glucose History</p>
                                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Mean value {'>'} 115 mg/dL over last 30 days</p>
                                                    </div>
                                                </div>
                                            </motion.section>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="submissions" className="space-y-10">
                                    <motion.section variants={itemVariants}>
                                        <DoctorSubmissionTable />
                                    </motion.section>
                                </TabsContent>

                                <TabsContent value="staff" className="space-y-10">
                                    <motion.section variants={itemVariants}>
                                        <StaffManagementTable />
                                    </motion.section>
                                </TabsContent>

                                <TabsContent value="arrivals" className="space-y-10">
                                    <motion.section variants={itemVariants}>
                                        <HospitalArrivalsTable />
                                    </motion.section>
                                </TabsContent>
                            </Tabs>

                        </motion.div>
                    </main>

                    <footer className="border-t border-white/5 py-12 mt-20 relative z-10">
                        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">HealthChain Clinical Network Registry</span>
                            </div>
                            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest text-center">
                                FERPA/HIPAA Compliant Node Interaction • Cryptographic Session: {walletAddress?.slice(0, 16)}... • Polygon Mainnet Layer
                            </p>
                            <div className="flex items-center gap-6">
                                <Link href="/support" className="text-[10px] font-black text-gray-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Support Center</Link>
                                <button className="text-[10px] font-black text-gray-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Smart Contract Audit</button>
                            </div>
                        </div>
                    </footer>
                </div>
            </HospitalDashboardGuard>
        </RequireAuth>
    );
}
