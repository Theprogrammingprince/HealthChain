"use client";

import { useMemo } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, ArrowLeft, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const generateDoctorNotifications = () => {
    const now = Date.now();
    return [
        {
            id: 1,
            type: "success",
            title: "Record Approved",
            description: "Patient 'Alice M.' approved your lab result submission. The record is now permanently stored on-chain.",
            timestamp: new Date(now - 1000 * 60 * 45), // 45 mins ago
            read: false
        },
        {
            id: 2,
            type: "info",
            title: "Hospital Verification Request",
            description: "City General Hospital has requested additional documentation for your staff profile.",
            timestamp: new Date(now - 1000 * 60 * 60 * 3), // 3 hours ago
            read: false
        },
        {
            id: 3,
            type: "alert",
            title: "Submission Rejected",
            description: "A clinical note for 'Kenzy S.' was rejected due to missing diagnostic codes. Please review and resubmit.",
            timestamp: new Date(now - 1000 * 60 * 60 * 24), // 1 day ago
            read: true
        }
    ];
};

export default function DoctorNotificationsPage() {
    const router = useRouter();
    const notifications = useMemo(() => generateDoctorNotifications(), []);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/doctor/dashboard")}
                            className="hover:bg-white/5 text-gray-400"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-tight">Activity Feed</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">System alerts & submission updates</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white/5 rounded-2xl border ${notif.read ? 'border-white/5' : 'border-indigo-500/20'} p-6 hover:bg-white/[0.07] transition-all cursor-pointer group`}
                        >
                            <div className="flex items-start gap-5">
                                <div className={`p-4 rounded-xl ${notif.type === 'alert' ? 'bg-red-500/10 text-red-400' :
                                        notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {notif.type === 'alert' && <AlertTriangle size={20} />}
                                    {notif.type === 'success' && <CheckCircle2 size={20} />}
                                    {notif.type === 'info' && <Info size={20} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-white font-bold group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{notif.title}</h3>
                                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <Clock size={10} />
                                            {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">{notif.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="text-gray-600" size={32} />
                            </div>
                            <h3 className="text-white font-black uppercase tracking-widest text-sm">All Quiet</h3>
                            <p className="text-gray-500 text-xs mt-2">No new updates or alerts at the moment.</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
