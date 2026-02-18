"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LifeBuoy,
    Send,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    MessageSquare,
    Plus,
    ChevronRight,
    User,
    Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
    id: string;
    subject: string;
    status: "open" | "in_progress" | "resolved";
    created_at: string;
    updated_at: string;
}

interface SupportMessage {
    id: string;
    ticket_id: string;
    sender: "user" | "admin";
    message: string;
    created_at: string;
}

export default function DashboardSupportPage() {
    const { supabaseUser, userVitals } = useAppStore();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [newSubject, setNewSubject] = useState("");
    const [newInitialMessage, setNewInitialMessage] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch tickets
    useEffect(() => {
        if (!supabaseUser) return;
        const fetchTickets = async () => {
            setIsLoadingTickets(true);
            try {
                const { data, error } = await supabase
                    .from("support_tickets")
                    .select("*")
                    .eq("user_id", supabaseUser.id)
                    .order("updated_at", { ascending: false });

                if (error) throw error;
                setTickets(data || []);
            } catch (err) {
                console.error("Failed to fetch tickets:", err);
                // Fallback: show empty state
                setTickets([]);
            } finally {
                setIsLoadingTickets(false);
            }
        };
        fetchTickets();
    }, [supabaseUser]);

    // Fetch messages for active ticket
    useEffect(() => {
        if (!activeTicket) return;
        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const { data, error } = await supabase
                    .from("support_messages")
                    .select("*")
                    .eq("ticket_id", activeTicket.id)
                    .order("created_at", { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (err) {
                console.error("Failed to fetch messages:", err);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();

        // Subscribe to real-time messages
        const channel = supabase
            .channel(`support_messages_${activeTicket.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "support_messages",
                    filter: `ticket_id=eq.${activeTicket.id}`,
                },
                (payload) => {
                    const newMsg = payload.new as SupportMessage;
                    setMessages((prev) => [...prev, newMsg]);
                    if (newMsg.sender === "admin") {
                        toast("Admin replied", { description: newMsg.message.slice(0, 60) + "..." });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTicket]);

    // Create new ticket
    const handleCreateTicket = async () => {
        if (!newSubject.trim() || !newInitialMessage.trim() || !supabaseUser) return;
        setIsCreating(true);
        try {
            // Create ticket
            const { data: ticket, error: ticketErr } = await supabase
                .from("support_tickets")
                .insert({
                    user_id: supabaseUser.id,
                    subject: newSubject.trim(),
                    status: "open",
                    user_name: userVitals.fullName || "Patient",
                    user_email: supabaseUser.email,
                })
                .select()
                .single();

            if (ticketErr) throw ticketErr;

            // Send initial message
            const { error: msgErr } = await supabase
                .from("support_messages")
                .insert({
                    ticket_id: ticket.id,
                    sender: "user",
                    message: newInitialMessage.trim(),
                    user_id: supabaseUser.id,
                });

            if (msgErr) throw msgErr;

            setTickets((prev) => [ticket, ...prev]);
            setActiveTicket(ticket);
            setNewSubject("");
            setNewInitialMessage("");
            setShowNewTicketForm(false);
            toast.success("Support ticket created");
        } catch (err) {
            console.error("Failed to create ticket:", err);
            toast.error("Failed to create ticket", { description: "Please try again." });
        } finally {
            setIsCreating(false);
        }
    };

    // Send message in active thread
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeTicket || !supabaseUser) return;
        setIsSending(true);
        try {
            const { error } = await supabase
                .from("support_messages")
                .insert({
                    ticket_id: activeTicket.id,
                    sender: "user",
                    message: newMessage.trim(),
                    user_id: supabaseUser.id,
                });

            if (error) throw error;
            setNewMessage("");
            inputRef.current?.focus();
        } catch (err) {
            console.error("Failed to send:", err);
            toast.error("Could not send message");
        } finally {
            setIsSending(false);
        }
    };

    const statusConfig = {
        open: { label: "Open", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: AlertCircle },
        in_progress: { label: "In Progress", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
        resolved: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-2xl">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/patient/dashboard" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-400" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#00BFFF]/10">
                                <LifeBuoy className="w-5 h-5 text-[#00BFFF]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black uppercase tracking-tight">Support Center</h1>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Secure Communication Channel</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => { setShowNewTicketForm(true); setActiveTicket(null); }}
                        className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold text-xs uppercase tracking-wider rounded-xl h-10 px-4"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Ticket
                    </Button>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">

                    {/* Left: Ticket List */}
                    <div className="lg:col-span-4 space-y-3">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Your Tickets ({tickets.length})
                        </h2>

                        {isLoadingTickets ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse h-24" />
                                ))}
                            </div>
                        ) : tickets.length === 0 && !showNewTicketForm ? (
                            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <Headphones className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">No Tickets Yet</p>
                                <Button
                                    onClick={() => setShowNewTicketForm(true)}
                                    variant="outline"
                                    className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Create Your First Ticket
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tickets.map(ticket => {
                                    const status = statusConfig[ticket.status];
                                    const StatusIcon = status.icon;
                                    const isActive = activeTicket?.id === ticket.id;
                                    return (
                                        <motion.button
                                            key={ticket.id}
                                            onClick={() => { setActiveTicket(ticket); setShowNewTicketForm(false); }}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isActive
                                                ? "bg-[#00BFFF]/10 border-[#00BFFF]/30"
                                                : "bg-white/5 border-white/5 hover:bg-white/[0.07] hover:border-white/10"
                                                }`}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm truncate">{ticket.subject}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color} ${status.border} border`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {status.label}
                                                        </span>
                                                        <span className="text-[10px] text-gray-600">
                                                            {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 mt-1 transition-colors ${isActive ? "text-[#00BFFF]" : "text-gray-700"}`} />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right: Chat / New Ticket Form */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {showNewTicketForm ? (
                                /* New Ticket Form */
                                <motion.div
                                    key="new-ticket"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
                                >
                                    <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                        <Plus className="text-[#00BFFF]" /> Create New Ticket
                                    </h2>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Subject</label>
                                            <input
                                                type="text"
                                                value={newSubject}
                                                onChange={(e) => setNewSubject(e.target.value)}
                                                placeholder="Brief description of your issue..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#00BFFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/30 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Describe Your Issue</label>
                                            <textarea
                                                value={newInitialMessage}
                                                onChange={(e) => setNewInitialMessage(e.target.value)}
                                                placeholder="Tell us what you need help with. Include as much detail as possible..."
                                                rows={5}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#00BFFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/30 transition-all resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleCreateTicket}
                                                disabled={!newSubject.trim() || !newInitialMessage.trim() || isCreating}
                                                className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold text-xs uppercase tracking-wider rounded-xl px-6 h-11"
                                            >
                                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                                Submit Ticket
                                            </Button>
                                            <Button
                                                onClick={() => setShowNewTicketForm(false)}
                                                variant="ghost"
                                                className="text-gray-500 hover:text-white text-xs uppercase tracking-wider rounded-xl"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : activeTicket ? (
                                /* Chat Thread */
                                <motion.div
                                    key={`ticket-${activeTicket.id}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[calc(100vh-14rem)]"
                                >
                                    {/* Chat Header */}
                                    <div className="p-4 sm:p-6 border-b border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg">{activeTicket.subject}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {(() => {
                                                        const status = statusConfig[activeTicket.status];
                                                        const StatusIcon = status.icon;
                                                        return (
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color} ${status.border} border`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {status.label}
                                                            </span>
                                                        );
                                                    })()}
                                                    <span className="text-[10px] text-gray-600">
                                                        Created {formatDistanceToNow(new Date(activeTicket.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                        {isLoadingMessages ? (
                                            <div className="flex items-center justify-center py-20">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-16">
                                                <MessageSquare className="mx-auto text-gray-700 mb-3" size={32} />
                                                <p className="text-gray-600 text-sm">No messages yet</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div className={`max-w-[80%] ${msg.sender === "user"
                                                        ? "bg-[#00BFFF]/15 border border-[#00BFFF]/20 rounded-2xl rounded-br-md"
                                                        : "bg-white/5 border border-white/10 rounded-2xl rounded-bl-md"
                                                        } px-4 py-3`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {msg.sender === "admin" ? (
                                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                    <Headphones className="w-3 h-3 text-emerald-400" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-[#00BFFF]/20 flex items-center justify-center">
                                                                    <User className="w-3 h-3 text-[#00BFFF]" />
                                                                </div>
                                                            )}
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.sender === "admin" ? "text-emerald-400" : "text-[#00BFFF]"
                                                                }`}>
                                                                {msg.sender === "admin" ? "Support Team" : "You"}
                                                            </span>
                                                            <span className="text-[9px] text-gray-600">
                                                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    {activeTicket.status !== "resolved" && (
                                        <div className="p-4 sm:p-6 border-t border-white/5">
                                            <div className="flex items-end gap-3">
                                                <textarea
                                                    ref={inputRef}
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                    placeholder="Type your message..."
                                                    rows={1}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#00BFFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/30 transition-all resize-none max-h-32"
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={!newMessage.trim() || isSending}
                                                    className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black rounded-xl h-11 w-11 p-0 flex-shrink-0"
                                                >
                                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-gray-700 mt-2">Press Enter to send, Shift+Enter for new line</p>
                                        </div>
                                    )}

                                    {activeTicket.status === "resolved" && (
                                        <div className="p-4 sm:p-6 border-t border-white/5 text-center">
                                            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Ticket Resolved</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                /* No ticket selected */
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl"
                                >
                                    <LifeBuoy className="w-16 h-16 text-gray-700 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-400 mb-1">Select a Ticket</h3>
                                    <p className="text-sm text-gray-600 mb-6">Choose an existing ticket or create a new one</p>
                                    <Button
                                        onClick={() => setShowNewTicketForm(true)}
                                        className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold text-xs uppercase tracking-wider rounded-xl"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> New Ticket
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
