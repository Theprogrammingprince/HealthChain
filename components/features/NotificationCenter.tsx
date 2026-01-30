"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Check,
    CheckCheck,
    FileText,
    Building2,
    User,
    ShieldCheck,
    X,
    AlertCircle,
    Clock,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    action_link: string | null;
    created_at: string;
}

export function NotificationCenter() {
    const { supabaseUser } = useAppStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (supabaseUser?.id) {
            fetchNotifications();
        }
    }, [supabaseUser?.id]);

    const fetchNotifications = async () => {
        if (!supabaseUser?.id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", supabaseUser.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (!error && data) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .in("id", unreadIds);

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "record_approved":
                return <Check className="w-4 h-4 text-emerald-400" />;
            case "record_rejected":
                return <X className="w-4 h-4 text-red-400" />;
            case "pending_approval":
                return <Clock className="w-4 h-4 text-amber-400" />;
            case "hospital_verified":
                return <Building2 className="w-4 h-4 text-blue-400" />;
            case "access_granted":
                return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
            case "emergency_alert":
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Bell className="w-4 h-4 text-gray-400" />;
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
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl hover:bg-white/10"
                >
                    <Bell className="h-5 w-5 text-gray-400" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0 bg-[#0A0A0A] border-white/10"
                align="end"
                sideOffset={8}
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white">Notifications</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3">
                                <Bell className="w-6 h-6 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-400">No notifications yet</p>
                            <p className="text-[10px] text-gray-600 mt-1">
                                We&apos;ll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            <AnimatePresence>
                                {notifications.map((notif, i) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className={`p-4 transition-colors cursor-pointer ${notif.is_read
                                                ? "bg-transparent hover:bg-white/5"
                                                : "bg-blue-500/5 hover:bg-blue-500/10"
                                            }`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-lg ${notif.is_read ? "bg-white/5" : "bg-white/10"
                                                }`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium ${notif.is_read ? "text-gray-400" : "text-white"
                                                        }`}>
                                                        {notif.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] text-gray-600 font-mono">
                                                            {formatTime(notif.created_at)}
                                                        </span>
                                                        {!notif.is_read && (
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                {notif.action_link && (
                                                    <Link
                                                        href={notif.action_link}
                                                        onClick={() => setOpen(false)}
                                                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest mt-2 inline-block"
                                                    >
                                                        View Details →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
