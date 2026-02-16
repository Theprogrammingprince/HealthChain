'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Send,
    CheckCircle2,
    Clock,
    MessageSquare,
    Inbox,
    Reply,
    X,
    Filter,
    Search,
    User,
    ArrowLeft,
    Loader2,
    MailOpen,
    ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Message {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    admin_reply: string | null;
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id: string) => {
        if (!replyContent.trim()) return;
        setSendingReply(true);

        try {
            const res = await fetch(`/api/admin/messages/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyContent }),
            });

            if (res.ok) {
                toast.success("Reply sent successfully", {
                    description: "The user has been notified via email."
                });
                setReplyingTo(null);
                setReplyContent('');
                fetchMessages();
            } else {
                const data = await res.json();
                toast.error("Failed to send reply", { description: data.error });
            }
        } catch {
            toast.error("An error occurred while sending reply");
        } finally {
            setSendingReply(false);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesFilter = filter === 'all' ||
            (filter === 'unread' && msg.status !== 'replied') ||
            (filter === 'replied' && msg.status === 'replied');

        const matchesSearch = searchQuery === '' ||
            `${msg.first_name} ${msg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const unreadCount = messages.filter(m => m.status === 'unread').length;
    const repliedCount = messages.filter(m => m.status === 'replied').length;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (first: string, last: string) => {
        return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/dashboard"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Inbox className="w-5 h-5 text-blue-400" />
                                </div>
                                Messages
                                {unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-gray-500">Unread</span>
                            <span className="font-bold text-white">{unreadCount}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-gray-500">Replied</span>
                            <span className="font-bold text-white">{repliedCount}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Total</span>
                            <span className="font-bold text-white">{messages.length}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters & Search Bar */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-white/5">
                    {/* Filter Tabs */}
                    <div className="flex bg-white/5 rounded-xl p-1 shrink-0">
                        {[
                            { key: 'all' as const, label: 'All', icon: MessageSquare },
                            { key: 'unread' as const, label: 'Unread', icon: Mail },
                            { key: 'replied' as const, label: 'Replied', icon: CheckCircle2 },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === key
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="max-w-7xl mx-auto px-6 pb-12 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredMessages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${msg.status === 'replied'
                                    ? 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
                                    : 'bg-[#0A0A0A] border-blue-500/10 hover:border-blue-500/20'
                                }`}
                        >
                            {/* Message Header */}
                            <div
                                className="p-6 cursor-pointer"
                                onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${msg.status === 'replied'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {getInitials(msg.first_name, msg.last_name)}
                                        </div>

                                        {/* Name & Preview */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-white text-base">
                                                    {msg.first_name} {msg.last_name}
                                                </h3>
                                                {msg.status === 'unread' && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">{msg.email}</p>
                                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right side: Status & Time */}
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${msg.status === 'replied'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : msg.status === 'unread'
                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                            {msg.status === 'replied' ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : (
                                                <Mail className="w-3 h-3" />
                                            )}
                                            {msg.status}
                                        </span>
                                        <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(msg.created_at)}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${expandedMessage === msg.id ? 'rotate-180' : ''
                                            }`} />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedMessage === msg.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
                                            {/* Full Message */}
                                            <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MailOpen className="w-4 h-4 text-gray-500" />
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Full Message</span>
                                                </div>
                                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                    {msg.message}
                                                </p>
                                            </div>

                                            {/* Admin Reply (if exists) */}
                                            {msg.admin_reply && (
                                                <div className="ml-6 bg-emerald-500/5 rounded-xl p-5 border border-emerald-500/10">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Reply className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Your Reply</span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                        {msg.admin_reply}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Reply Section */}
                                            {msg.status !== 'replied' && (
                                                <div className="pt-2">
                                                    {replyingTo === msg.id ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="space-y-4"
                                                        >
                                                            <div className="relative">
                                                                <textarea
                                                                    placeholder="Write your reply..."
                                                                    value={replyContent}
                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                    rows={4}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleReply(msg.id)}
                                                                    disabled={sendingReply || !replyContent.trim()}
                                                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                                                                >
                                                                    {sendingReply ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Send className="w-4 h-4" />
                                                                    )}
                                                                    {sendingReply ? 'Sending...' : 'Send Reply'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo(null);
                                                                        setReplyContent('');
                                                                    }}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-300 text-sm font-medium rounded-xl hover:bg-white/5 transition-all"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReplyingTo(msg.id);
                                                                setReplyContent('');
                                                            }}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-blue-600/10 border border-white/10 hover:border-blue-500/30 text-gray-300 hover:text-blue-400 text-sm font-bold rounded-xl transition-all"
                                                        >
                                                            <Reply className="w-4 h-4" />
                                                            Reply to {msg.first_name}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {filteredMessages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-[#0A0A0A] rounded-3xl border border-dashed border-white/10"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <Inbox className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 mb-2">
                            {searchQuery ? 'No matching messages' : filter !== 'all' ? `No ${filter} messages` : 'No messages yet'}
                        </h3>
                        <p className="text-gray-600 text-sm max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try adjusting your search query or clearing filters.'
                                : 'When users contact you through the support form, their messages will appear here.'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
