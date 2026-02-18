'use client';

import { useState, useEffect, useRef } from 'react';
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
    Search,
    User,
    ArrowLeft,
    Loader2,
    MailOpen,
    ChevronDown,
    LifeBuoy,
    AlertCircle,
    Headphones
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ──────────── Types ────────────
interface ContactMessage {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    admin_reply: string | null;
    created_at: string;
}

interface SupportTicket {
    id: string;
    user_id: string;
    user_name: string | null;
    user_email: string | null;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: string;
    updated_at: string;
    latest_message: string;
    latest_message_sender: string;
    has_unread: boolean;
}

interface TicketMessage {
    id: string;
    ticket_id: string;
    sender: 'user' | 'admin';
    message: string;
    created_at: string;
}

// ──────────── Helper ────────────
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

const getInitials = (first: string, last: string) =>
    `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;

// ──────────── Component ────────────
export default function AdminMessagesPage() {
    const [activeView, setActiveView] = useState<'contact' | 'support'>('support');

    // ───── Contact messages state ─────
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'replied'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

    // ───── Support tickets state ─────
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
    const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
    const [ticketReply, setTicketReply] = useState('');
    const [sendingTicketReply, setSendingTicketReply] = useState(false);
    const [loadingTicketMessages, setLoadingTicketMessages] = useState(false);
    const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
    const [ticketSearch, setTicketSearch] = useState('');

    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ───── Scroll to bottom ─────
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticketMessages]);

    // ───── Fetch all data ─────
    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            const data = await res.json();
            if (data.messages) setMessages(data.messages);
            if (data.support_tickets) setTickets(data.support_tickets);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    // ───── Fetch ticket messages ─────
    const fetchTicketMessages = async (ticketId: string) => {
        setLoadingTicketMessages(true);
        try {
            const res = await fetch(`/api/admin/support/${ticketId}`);
            const data = await res.json();
            if (data.messages) setTicketMessages(data.messages);
        } catch {
            toast.error("Failed to load ticket messages");
        } finally {
            setLoadingTicketMessages(false);
        }
    };

    const handleSelectTicket = (ticket: SupportTicket) => {
        setActiveTicket(ticket);
        fetchTicketMessages(ticket.id);
    };

    // ───── Contact reply handler ─────
    const handleContactReply = async (id: string) => {
        if (!replyContent.trim()) return;
        setSendingReply(true);

        try {
            const res = await fetch(`/api/admin/messages/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyContent }),
            });

            if (res.ok) {
                toast.success("Reply sent successfully", { description: "The user has been notified via email." });
                setReplyingTo(null);
                setReplyContent('');
                fetchAll();
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

    // ───── Support ticket reply handler ─────
    const handleTicketReply = async (status?: string) => {
        if (!ticketReply.trim() || !activeTicket) return;
        setSendingTicketReply(true);

        try {
            const res = await fetch(`/api/admin/support/${activeTicket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reply: ticketReply,
                    status: status || undefined,
                }),
            });

            if (res.ok) {
                toast.success("Reply sent to patient");
                setTicketReply('');
                fetchTicketMessages(activeTicket.id);
                fetchAll(); // refresh ticket list
            } else {
                const data = await res.json();
                toast.error("Failed to send reply", { description: data.error });
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setSendingTicketReply(false);
        }
    };

    // ───── Resolve ticket ─────
    const handleResolveTicket = async () => {
        if (!activeTicket) return;
        const resolveReply = ticketReply.trim() || "Your ticket has been resolved. Thank you for contacting HealthChain support!";
        setSendingTicketReply(true);

        try {
            const res = await fetch(`/api/admin/support/${activeTicket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reply: resolveReply,
                    status: 'resolved',
                }),
            });

            if (res.ok) {
                toast.success("Ticket resolved");
                setTicketReply('');
                setActiveTicket(null);
                fetchAll();
            }
        } catch {
            toast.error("Failed to resolve ticket");
        } finally {
            setSendingTicketReply(false);
        }
    };

    // ───── Filters ─────
    const filteredMessages = messages.filter(msg => {
        const matchesFilter = contactFilter === 'all' ||
            (contactFilter === 'unread' && msg.status !== 'replied') ||
            (contactFilter === 'replied' && msg.status === 'replied');
        const matchesSearch = searchQuery === '' ||
            `${msg.first_name} ${msg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filteredTickets = tickets.filter(t => {
        const matchesFilter = ticketFilter === 'all' ||
            (ticketFilter === 'open' && t.status !== 'resolved') ||
            (ticketFilter === 'resolved' && t.status === 'resolved');
        const matchesSearch = ticketSearch === '' ||
            (t.user_name || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
            (t.user_email || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
            t.subject.toLowerCase().includes(ticketSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const unreadContactCount = messages.filter(m => m.status === 'unread').length;
    const openTicketCount = tickets.filter(t => t.status !== 'resolved' && t.has_unread).length;

    // ───── Loading ─────
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
                            </h1>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                        <button
                            onClick={() => { setActiveView('support'); setActiveTicket(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeView === 'support'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <LifeBuoy className="w-3.5 h-3.5" />
                            Support Tickets
                            {openTicketCount > 0 && (
                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">
                                    {openTicketCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveView('contact'); setActiveTicket(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeView === 'contact'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Mail className="w-3.5 h-3.5" />
                            Contact Form
                            {unreadContactCount > 0 && (
                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">
                                    {unreadContactCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* ═══════════════════════════════════════════ */}
                {/* SUPPORT TICKETS VIEW */}
                {/* ═══════════════════════════════════════════ */}
                {activeView === 'support' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
                        {/* Left: Ticket List */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col gap-3">
                                <div className="flex bg-white/5 rounded-xl p-1">
                                    {[
                                        { key: 'all' as const, label: 'All' },
                                        { key: 'open' as const, label: 'Active' },
                                        { key: 'resolved' as const, label: 'Resolved' },
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setTicketFilter(key)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${ticketFilter === key
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search tickets..."
                                        value={ticketSearch}
                                        onChange={(e) => setTicketSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Ticket List */}
                            <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                                {filteredTickets.length === 0 ? (
                                    <div className="text-center py-16 bg-[#0A0A0A] rounded-2xl border border-dashed border-white/10">
                                        <LifeBuoy className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm font-bold">No support tickets</p>
                                    </div>
                                ) : (
                                    filteredTickets.map(ticket => {
                                        const isActive = activeTicket?.id === ticket.id;
                                        const statusColors = {
                                            open: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                                            in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                            resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                        };
                                        const statusLabels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' };

                                        return (
                                            <button
                                                key={ticket.id}
                                                onClick={() => handleSelectTicket(ticket)}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isActive
                                                    ? 'bg-blue-600/10 border-blue-500/30'
                                                    : 'bg-[#0A0A0A] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {ticket.has_unread && (
                                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                                                            )}
                                                            <h3 className="font-bold text-sm truncate">{ticket.subject}</h3>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2 truncate">
                                                            {ticket.user_name || 'Patient'} • {ticket.user_email || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-600 truncate">{ticket.latest_message}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[ticket.status]}`}>
                                                            {statusLabels[ticket.status]}
                                                        </span>
                                                        <span className="text-[10px] text-gray-600">{formatDate(ticket.updated_at)}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right: Chat Thread */}
                        <div className="lg:col-span-8">
                            {activeTicket ? (
                                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl flex flex-col h-[calc(100vh-12rem)]">
                                    {/* Chat Header */}
                                    <div className="p-5 border-b border-white/5 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{activeTicket.subject}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    From: {activeTicket.user_name || 'Patient'} ({activeTicket.user_email || 'N/A'})
                                                </span>
                                                <span className="text-[10px] text-gray-600">
                                                    {formatDate(activeTicket.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        {activeTicket.status !== 'resolved' && (
                                            <button
                                                onClick={handleResolveTicket}
                                                disabled={sendingTicketReply}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-500/20 transition-colors"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Resolve
                                            </button>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                        {loadingTicketMessages ? (
                                            <div className="flex items-center justify-center py-20">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                                            </div>
                                        ) : ticketMessages.length === 0 ? (
                                            <div className="text-center py-16">
                                                <MessageSquare className="mx-auto text-gray-700 mb-3" size={32} />
                                                <p className="text-gray-600 text-sm">No messages yet</p>
                                            </div>
                                        ) : (
                                            ticketMessages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[75%] ${msg.sender === 'admin'
                                                        ? 'bg-blue-600/15 border border-blue-500/20 rounded-2xl rounded-br-md'
                                                        : 'bg-white/5 border border-white/10 rounded-2xl rounded-bl-md'
                                                        } px-4 py-3`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {msg.sender === 'user' ? (
                                                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                                                    <User className="w-3 h-3 text-gray-400" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                    <Headphones className="w-3 h-3 text-blue-400" />
                                                                </div>
                                                            )}
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.sender === 'admin' ? 'text-blue-400' : 'text-gray-500'
                                                                }`}>
                                                                {msg.sender === 'admin' ? 'You (Admin)' : activeTicket.user_name || 'Patient'}
                                                            </span>
                                                            <span className="text-[9px] text-gray-600">
                                                                {formatDate(msg.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Reply Input */}
                                    {activeTicket.status !== 'resolved' ? (
                                        <div className="p-4 border-t border-white/5">
                                            <div className="flex items-end gap-3">
                                                <textarea
                                                    value={ticketReply}
                                                    onChange={(e) => setTicketReply(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleTicketReply();
                                                        }
                                                    }}
                                                    placeholder="Type your reply..."
                                                    rows={2}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
                                                />
                                                <button
                                                    onClick={() => handleTicketReply()}
                                                    disabled={!ticketReply.trim() || sendingTicketReply}
                                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 h-[52px]"
                                                >
                                                    {sendingTicketReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                    Send
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-2">Enter to send • Shift+Enter for new line</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 border-t border-white/5 text-center">
                                            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Ticket Resolved</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-20 bg-[#0A0A0A] border border-dashed border-white/10 rounded-2xl">
                                    <LifeBuoy className="w-16 h-16 text-gray-700 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-400 mb-1">Select a Ticket</h3>
                                    <p className="text-sm text-gray-600">Choose a support ticket from the left to view the conversation</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* CONTACT FORM MESSAGES VIEW */}
                {/* ═══════════════════════════════════════════ */}
                {activeView === 'contact' && (
                    <>
                        {/* Filters & Search */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-white/5 mb-6">
                            <div className="flex bg-white/5 rounded-xl p-1 shrink-0">
                                {[
                                    { key: 'all' as const, label: 'All', icon: MessageSquare },
                                    { key: 'unread' as const, label: 'Unread', icon: Mail },
                                    { key: 'replied' as const, label: 'Replied', icon: CheckCircle2 },
                                ].map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setContactFilter(key)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${contactFilter === key
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
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

                        {/* Contact Messages List */}
                        <div className="space-y-4 pb-12">
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
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${msg.status === 'replied'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                        {getInitials(msg.first_name, msg.last_name)}
                                                    </div>
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
                                                <div className="flex flex-col items-end gap-3 shrink-0">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${msg.status === 'replied'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : msg.status === 'unread'
                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                        }`}>
                                                        {msg.status === 'replied' ? <CheckCircle2 className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                                                        {msg.status}
                                                    </span>
                                                    <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(msg.created_at)}
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${expandedMessage === msg.id ? 'rotate-180' : ''}`} />
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

                                                        {/* Admin Reply */}
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
                                                                        <textarea
                                                                            placeholder="Write your reply..."
                                                                            value={replyContent}
                                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                                            rows={4}
                                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all"
                                                                        />
                                                                        <div className="flex items-center gap-3">
                                                                            <button
                                                                                onClick={() => handleContactReply(msg.id)}
                                                                                disabled={sendingReply || !replyContent.trim()}
                                                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                                                                            >
                                                                                {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                                                {sendingReply ? 'Sending...' : 'Send Reply'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                                                                                className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-300 text-sm font-medium rounded-xl hover:bg-white/5 transition-all"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setReplyingTo(msg.id); setReplyContent(''); }}
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
                                        {searchQuery ? 'No matching messages' : contactFilter !== 'all' ? `No ${contactFilter} messages` : 'No contact messages yet'}
                                    </h3>
                                    <p className="text-gray-600 text-sm max-w-sm mx-auto">
                                        {searchQuery
                                            ? 'Try adjusting your search query or clearing filters.'
                                            : 'When users contact you through the contact form, their messages will appear here.'}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
