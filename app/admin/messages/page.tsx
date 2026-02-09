'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

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
        } catch (err) {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id: string) => {
        if (!replyContent.trim()) return;

        try {
            const res = await fetch(`/api/admin/messages/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyContent }),
            });

            if (res.ok) {
                toast.success("Reply sent successfully");
                setReplyingTo(null);
                setReplyContent('');
                fetchMessages();
            } else {
                toast.error("Failed to send reply");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
                    <p className="text-gray-400">Manage inquiries from users and partners.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {messages.map((msg) => (
                    <Card key={msg.id} className="bg-white/5 border-white/10 text-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">
                                        {msg.first_name} {msg.last_name}
                                    </CardTitle>
                                    <p className="text-sm text-gray-400">{msg.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant={msg.status === 'replied' ? 'default' : 'secondary'}
                                    className={msg.status === 'unread' ? 'bg-blue-500/20 text-blue-400 border-none' : ''}
                                >
                                    {msg.status.toUpperCase()}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                            </div>

                            {msg.admin_reply && (
                                <div className="ml-6 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-blue-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Admin Reply:</span>
                                    </div>
                                    <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                        <p className="text-gray-400 text-sm whitespace-pre-wrap">{msg.admin_reply}</p>
                                    </div>
                                </div>
                            )}

                            {msg.status !== 'replied' && (
                                <div className="pt-2">
                                    {replyingTo === msg.id ? (
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Type your reply here..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="bg-black/40 border-white/10 text-white min-h-[120px] focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleReply(msg.id)}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white"
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Reply
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setReplyingTo(null)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => setReplyingTo(msg.id)}
                                            variant="outline"
                                            className="border-white/10 text-white hover:bg-white/5"
                                        >
                                            Reply to Message
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {messages.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400">No messages found</h3>
                        <p className="text-gray-500">When users contact you, their messages will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
