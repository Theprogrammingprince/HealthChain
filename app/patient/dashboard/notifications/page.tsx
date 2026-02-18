"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, ExternalLink, Loader2, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    action_link?: string;
    created_at: string;
}

export default function NotificationsPage() {
    const { supabaseUser } = useAppStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    // Fetch notifications from Supabase
    useEffect(() => {
        if (!supabaseUser) return;

        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", supabaseUser.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setNotifications(data || []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setNotifications([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();

        // Subscribe to new notifications in real-time
        const channel = supabase
            .channel(`notifications_page_${supabaseUser.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${supabaseUser.id}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications((prev) => [newNotif, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabaseUser]);

    // Mark as read
    const handleMarkRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", id);

            if (error) throw error;
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        if (!supabaseUser) return;
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", supabaseUser.id)
                .eq("read", false);

            if (error) throw error;
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    // Delete notification
    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Notification removed");
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case "emergency_alert":
            case "alert":
                return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
            case "access_granted":
            case "success":
            case "approved":
                return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
            default:
                return { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
        }
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-6 md:p-12">
            <header className="max-w-4xl mx-auto mb-8 sm:mb-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                            <Bell className="text-gray-400" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-[#00BFFF] text-black text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm">System alerts, updates, and access logs requiring your attention.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllRead}
                                variant="outline"
                                size="sm"
                                className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-xs uppercase tracking-wider"
                            >
                                <Check className="w-3 h-3 mr-2" /> Mark All Read
                            </Button>
                        )}
                        <Link href="/patient/dashboard" className="text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-2">
                            <ExternalLink size={14} />
                            Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mt-6">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === "all"
                            ? "bg-[#00BFFF] text-black"
                            : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                            }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === "unread"
                            ? "bg-[#00BFFF] text-black"
                            : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((notif) => {
                            const config = getTypeConfig(notif.type);
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    className={`bg-white/5 rounded-2xl border ${notif.read ? "border-white/5" : "border-[#00BFFF]/30"} p-4 sm:p-6 hover:bg-white/[0.07] transition-all group`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${config.bg} border ${config.border} flex-shrink-0`}>
                                            <Icon className={config.color} size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-[#00BFFF] transition-colors">
                                                    {notif.title}
                                                    {!notif.read && (
                                                        <span className="inline-block w-2 h-2 bg-[#00BFFF] rounded-full ml-2 align-middle" />
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    {!notif.read && (
                                                        <button
                                                            onClick={() => handleMarkRead(notif.id)}
                                                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-[#00BFFF] transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notif.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-1">{notif.message}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600">
                                                    <Clock size={12} />
                                                    <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                                                </div>
                                                {notif.action_link && (
                                                    <Link
                                                        href={notif.action_link}
                                                        className="text-[10px] sm:text-xs text-[#00BFFF] font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                                                    >
                                                        View Details <ExternalLink size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {!isLoading && filteredNotifications.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10"
                    >
                        <Bell className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                            {filter === "unread" ? "No Unread Notifications" : "All Caught Up"}
                        </p>
                        <p className="text-gray-600 text-xs mt-2">
                            {filter === "unread" ? "Switch to 'All' to see past notifications" : "You'll be notified when something needs your attention"}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
