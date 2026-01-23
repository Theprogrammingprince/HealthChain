"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Bell, ArrowLeft, Check, Building2, User, Shield,
    Clock, Trash2, CheckCheck, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { RequireAuth } from "@/components/features/RequireAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
    id: string;
    user_id: string;
    sender_id: string | null;
    type: "permission_granted" | "emergency_alert" | "system" | "hospital_registered";
    title: string;
    message: string;
    is_read: boolean;
    action_link: string | null;
    created_at: string;
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // Fetch admin-related notifications (system-wide or for admin user)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .or(`user_id.eq.${user.id},type.eq.system,type.eq.hospital_registered`)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) {
                console.error("Error fetching notifications:", error);
                toast.error("Failed to load notifications");
                return;
            }

            setNotifications(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to update notification");
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length === 0) return;

            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .in("id", unreadIds);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update notifications");
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete notification");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "hospital_registered":
                return <Building2 className="w-5 h-5 text-blue-400" />;
            case "emergency_alert":
                return <Shield className="w-5 h-5 text-red-400" />;
            case "permission_granted":
                return <User className="w-5 h-5 text-emerald-400" />;
            default:
                return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <RequireAuth requiredRole="Admin">
            <div className="min-h-screen bg-[#050505] pb-20 font-sans text-white">
                {/* Header */}
                <header className="bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-50">
                    <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/dashboard"
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-400" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                                    <Bell className="text-blue-500" size={18} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black uppercase tracking-tight">Notifications</h1>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchNotifications}
                                disabled={loading}
                                className="text-gray-400 hover:text-white"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="border-white/10 text-white hover:bg-white/5"
                                >
                                    <CheckCheck className="w-4 h-4 mr-2" />
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-[1200px] mx-auto px-6 py-8">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3 bg-white/10" />
                                            <Skeleton className="h-3 w-2/3 bg-white/10" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                                <Bell className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-300 mb-2">No Notifications</h3>
                            <p className="text-gray-500 max-w-md">
                                You're all caught up! System notifications and alerts will appear here.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3"
                        >
                            {notifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group p-5 rounded-2xl border transition-all cursor-pointer ${notif.is_read
                                            ? 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                            : 'bg-blue-600/5 border-blue-500/20 hover:bg-blue-600/10'
                                        }`}
                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl border ${notif.is_read
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-blue-500/10 border-blue-500/20'
                                            }`}>
                                            {getIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h4 className={`font-bold text-sm ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-[10px] text-gray-600 font-mono">
                                                        {formatTime(notif.created_at)}
                                                    </span>
                                                    {!notif.is_read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {notif.action_link && (
                                                    <Link
                                                        href={notif.action_link}
                                                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                                                    >
                                                        View Details →
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notif.id);
                                                    }}
                                                    className="text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </main>
            </div>
        </RequireAuth>
    );
}
