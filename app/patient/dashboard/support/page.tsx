"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
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
    Headphones,
    Paperclip,
    Image as ImageIcon,
    FileText,
    Download,
    X
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
    attachment_url?: string | null;
    attachment_name?: string | null;
    attachment_type?: string | null;
}

const isImageType = (type: string | null | undefined) =>
    type?.startsWith('image/') || false;

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

    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                setTickets([]);
            } finally {
                setIsLoadingTickets(false);
            }
        };
        fetchTickets();
    }, [supabaseUser]);

    // Fetch messages for active ticket + realtime subscription
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
                    setMessages((prev) => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
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

    // File upload handler
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large", { description: "Maximum file size is 10MB." });
            return;
        }

        setSelectedFile(file);
    };

    const uploadFile = async (file: File, ticketId: string): Promise<{ url: string; name: string; type: string } | null> => {
        setUploadingFile(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `support/${ticketId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase
                .storage
                .from('support-attachments')
                .upload(path, file, { cacheControl: '3600', upsert: false });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error("Upload failed", { description: uploadError.message });
                return null;
            }

            const { data: urlData } = supabase
                .storage
                .from('support-attachments')
                .getPublicUrl(path);

            return {
                url: urlData.publicUrl,
                name: file.name,
                type: file.type,
            };
        } catch (err) {
            console.error('File upload error:', err);
            toast.error("Upload failed");
            return null;
        } finally {
            setUploadingFile(false);
        }
    };

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
        if ((!newMessage.trim() && !selectedFile) || !activeTicket || !supabaseUser) return;
        setIsSending(true);
        try {
            let attachmentData = null;

            // Upload file if selected
            if (selectedFile) {
                attachmentData = await uploadFile(selectedFile, activeTicket.id);
                if (!attachmentData && !newMessage.trim()) {
                    setIsSending(false);
                    return;
                }
            }

            const messageData: Record<string, unknown> = {
                ticket_id: activeTicket.id,
                sender: "user",
                message: newMessage.trim() || (attachmentData ? `📎 Sent a file: ${attachmentData.name}` : ''),
                user_id: supabaseUser.id,
            };

            if (attachmentData) {
                messageData.attachment_url = attachmentData.url;
                messageData.attachment_name = attachmentData.name;
                messageData.attachment_type = attachmentData.type;
            }

            const { error } = await supabase
                .from("support_messages")
                .insert(messageData);

            if (error) throw error;
            setNewMessage("");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            inputRef.current?.focus();
        } catch (err) {
            console.error("Failed to send:", err);
            toast.error("Could not send message");
        } finally {
            setIsSending(false);
        }
    };

    // Render attachment
    const renderAttachment = (msg: SupportMessage) => {
        if (!msg.attachment_url) return null;

        if (isImageType(msg.attachment_type)) {
            return (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-[280px]">
                    <Image
                        src={msg.attachment_url}
                        alt={msg.attachment_name || 'Image'}
                        width={280}
                        height={200}
                        className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.attachment_url!, '_blank')}
                        unoptimized
                    />
                    <div className="p-2 bg-white/5 flex items-center gap-2 text-[10px] text-gray-500">
                        <ImageIcon className="w-3 h-3" />
                        <span className="truncate">{msg.attachment_name}</span>
                    </div>
                </div>
            );
        }

        return (
            <a
                href={msg.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors max-w-[280px]"
            >
                <div className="w-9 h-9 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#00BFFF]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{msg.attachment_name || 'File'}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{msg.attachment_type?.split('/')[1] || 'file'}</p>
                </div>
                <Download className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </a>
        );
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

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-h-[calc(100vh-8rem)]">
                    {/* Ticket List */}
                    <div className="lg:col-span-4 space-y-3 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
                        {isLoadingTickets ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <LifeBuoy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 mb-2">No Tickets Yet</h3>
                                <p className="text-sm text-gray-600 mb-6">Create your first support ticket</p>
                                <Button
                                    onClick={() => setShowNewTicketForm(true)}
                                    className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold text-xs uppercase tracking-wider rounded-xl"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> New Ticket
                                </Button>
                            </div>
                        ) : (
                            tickets.map((ticket) => {
                                const status = statusConfig[ticket.status];
                                const StatusIcon = status.icon;
                                return (
                                    <button
                                        key={ticket.id}
                                        onClick={() => { setActiveTicket(ticket); setShowNewTicketForm(false); setSelectedFile(null); }}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all ${activeTicket?.id === ticket.id
                                            ? "bg-[#00BFFF]/5 border-[#00BFFF]/20"
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-sm truncate mb-1">{ticket.subject}</h3>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color} ${status.border} border`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[10px] text-gray-600">
                                                    {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-700" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Chat / New Ticket Form */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {showNewTicketForm ? (
                                <motion.div
                                    key="new-ticket"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8"
                                >
                                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-[#00BFFF]/10">
                                            <MessageSquare className="w-5 h-5 text-[#00BFFF]" />
                                        </div>
                                        New Support Ticket
                                    </h2>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                value={newSubject}
                                                onChange={(e) => setNewSubject(e.target.value)}
                                                placeholder="Brief description of your issue..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#00BFFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/30 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                value={newInitialMessage}
                                                onChange={(e) => setNewInitialMessage(e.target.value)}
                                                placeholder="Describe your issue in detail..."
                                                rows={5}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#00BFFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/30 transition-all resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={handleCreateTicket}
                                                disabled={!newSubject.trim() || !newInitialMessage.trim() || isCreating}
                                                className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-6"
                                            >
                                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                                Submit Ticket
                                            </Button>
                                            <Button
                                                onClick={() => setShowNewTicketForm(false)}
                                                variant="ghost"
                                                className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : activeTicket ? (
                                <motion.div
                                    key={`ticket-${activeTicket.id}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white/5 rounded-2xl border border-white/10 flex flex-col h-[calc(100vh-10rem)]"
                                >
                                    {/* Chat Header */}
                                    <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-base sm:text-lg">{activeTicket.subject}</h3>
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
                                                        {renderAttachment(msg)}
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    {activeTicket.status !== "resolved" && (
                                        <div className="p-4 sm:p-6 border-t border-white/5">
                                            {/* Selected file preview */}
                                            {selectedFile && (
                                                <div className="mb-3 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                                    {selectedFile.type.startsWith('image/') ? (
                                                        <ImageIcon className="w-5 h-5 text-[#00BFFF] flex-shrink-0" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-[#00BFFF] flex-shrink-0" />
                                                    )}
                                                    <span className="text-xs text-gray-300 truncate flex-1">{selectedFile.name}</span>
                                                    <span className="text-[10px] text-gray-600">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                                                    <button
                                                        onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                        className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                                    >
                                                        <X className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex items-end gap-3">
                                                {/* File upload button */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                                                    className="hidden"
                                                    onChange={handleFileSelect}
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                                                    title="Attach file or image"
                                                >
                                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                                </button>

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
                                                    disabled={(!newMessage.trim() && !selectedFile) || isSending || uploadingFile}
                                                    className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black rounded-xl h-11 w-11 p-0 flex-shrink-0"
                                                >
                                                    {(isSending || uploadingFile) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-gray-700 mt-2">Enter to send • Shift+Enter for new line • 📎 for photos & documents</p>
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
