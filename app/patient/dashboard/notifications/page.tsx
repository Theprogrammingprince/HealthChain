"use client";

import { useAppStore } from "@/lib/store";
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
    // We'll mock some notifications purely for the UI demonstration
    // In a real app, this would be in the store alongside activityLogs
    const notifications = [
        {
            id: 1,
            type: "alert",
            title: "Emergency Access Attempt Blocked",
            description: "An unauthorized attempt to access your records was detected and blocked by the Guardian protocol.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            read: false
        },
        {
            id: 2,
            type: "success",
            title: "Results Verification Complete",
            description: "Dr. Sarah Chen verified your 'Annual Blood Panel' results on-chain. Integity check passed.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false
        },
        {
            id: 3,
            type: "info",
            title: "Wallet Connected",
            description: "New session established from IP 192.168.1.1. If this wasn't you, disconnect immediately.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12">
            <header className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <Bell className="text-gray-400" />
                        Notifications
                    </h1>
                    <p className="text-gray-500">System alerts, updates, and access logs requiring your attention.</p>
                </div>
                <Link href="/patient/dashboard" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink size={14} /> Back to Dashboard
                </Link>
            </header>

            <div className="max-w-4xl mx-auto space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-6 rounded-2xl border transition-all hover:bg-white/5 ${notif.read
                            ? 'bg-transparent border-white/5 opacity-60'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${notif.type === 'alert' ? 'bg-red-500/10 text-red-500' :
                                notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                {notif.type === 'alert' && <AlertTriangle size={20} />}
                                {notif.type === 'success' && <CheckCircle2 size={20} />}
                                {notif.type === 'info' && <Info size={20} />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold text-lg ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                                        <Clock size={12} />
                                        {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {notif.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Bell className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500 font-bold uppercase tracking-widest">All Caught Up</p>
                    </div>
                )}
            </div>
        </div>
    );
}
