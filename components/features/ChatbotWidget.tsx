"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, User, Sparkles, RotateCcw } from "lucide-react";
import Image from "next/image";

interface ChatMessage {
    role: "user" | "bot";
    content: string;
    timestamp: Date;
}

// ──────────────────────────────────────────────────────────
// Local keyword-based fallback (used when AI API is unavailable)
// ──────────────────────────────────────────────────────────
const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
    {
        keywords: ["what", "healthchain", "about", "platform"],
        response: "HealthChain is a blockchain-powered health records platform that puts you in control of your medical data. We use AES-256 encryption and decentralized IPFS storage to ensure your records are secure, tamper-proof, and accessible only by you and those you authorize."
    },
    {
        keywords: ["secure", "security", "safe", "encryption", "privacy"],
        response: "Security is our top priority. HealthChain uses:\n\n• **AES-256 encryption** for all stored records\n• **IPFS decentralized storage** — no single point of failure\n• **Blockchain verification** — tamper-proof audit trail\n• **Zero-knowledge access** — only you hold the keys\n• **HIPAA & GDPR compliance** built-in"
    },
    {
        keywords: ["sign up", "register", "account", "get started", "join"],
        response: "Getting started is easy!\n\n1. Click **\"Get Started\"** at the top of the page\n2. Choose your role (Patient, Doctor, or Hospital)\n3. Create your account with email or Google\n4. Set up your profile and you're ready to go!\n\nIt takes less than 2 minutes. 🚀"
    },
    {
        keywords: ["cost", "price", "free", "pricing", "plan", "pay"],
        response: "HealthChain is currently **free to use** for patients! We believe everyone deserves secure access to their health records.\n\nHospitals and healthcare providers have custom plans based on their size and needs. Contact our team for details."
    },
    {
        keywords: ["doctor", "hospital", "provider", "clinical"],
        response: "**For Doctors:** Register and verify your credentials through your affiliated hospital. Once approved, you can securely access patient records (with consent), add diagnoses, and manage clinical workflows.\n\n**For Hospitals:** Register your facility and get verified by our admin team. Then manage staff, patient records, and clinical operations."
    },
    {
        keywords: ["emergency", "sos", "urgent", "crisis"],
        response: "HealthChain has a built-in **Emergency Mode** (SOS). When activated:\n\n• All guardians and emergency contacts are instantly notified\n• Temporary access is granted to essential medical records\n• Your blood type, allergies, and conditions are immediately visible\n\nThis can save lives in critical situations. 🏥"
    },
    {
        keywords: ["record", "upload", "document", "file", "medical"],
        response: "You can upload and manage all types of medical documents:\n\n• **Lab Results** — blood tests, urinalysis, etc.\n• **Radiology** — X-rays, MRIs, CT scans\n• **Prescriptions** — pharmacy records\n• **General** — discharge summaries, referrals\n\nAll documents are encrypted and stored on IPFS."
    },
    {
        keywords: ["blockchain", "decentralized", "ipfs", "web3"],
        response: "We leverage blockchain technology to ensure:\n\n• **Immutability** — records cannot be altered once verified\n• **Transparency** — every access is logged on-chain\n• **Decentralization** — no single entity controls your data\n• **Interoperability** — share records across providers seamlessly"
    },
    {
        keywords: ["contact", "support", "help", "reach", "email"],
        response: "You can reach our team through:\n\n• **Contact Page** — Visit our contact page for direct inquiries\n• **Dashboard Support** — Registered users can create support tickets\n• **FAQ** — Check our FAQ page for common questions\n\nWe're here to help! 💬"
    },
    {
        keywords: ["access", "permission", "share", "consent", "authorize"],
        response: "HealthChain gives you full control over who sees your data:\n\n• **Grant Access** — Choose specific providers\n• **Access Levels** — View summary, view records, or full access\n• **One-Time Codes** — Generate temporary access codes\n• **Revoke Anytime** — Remove access instantly"
    },
    {
        keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"],
        response: "Hello! 👋 I'm Jasmin, the HealthChain assistant! I'm here to answer your questions about our platform. What would you like to know?"
    },
    {
        keywords: ["thank", "thanks", "awesome", "great", "perfect"],
        response: "You're welcome! 😊 If you have any more questions, feel free to ask. I'm always here to help!"
    },
];

function findLocalResponse(input: string): string {
    const lower = input.toLowerCase().trim();
    let bestScore = 0;
    let bestResponse = "";

    for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        for (const keyword of item.keywords) {
            if (lower.includes(keyword)) {
                score += keyword.length;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestResponse = item.response;
        }
    }

    if (bestScore > 0) return bestResponse;

    return "I'm Jasmin, the HealthChain assistant. I can only help with HealthChain-related questions — features, security, pricing, and more. Is there something about HealthChain I can help with?";
}

// ──────────────────────────────────────────────────────────
// ChatbotWidget Component
// ──────────────────────────────────────────────────────────
export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "bot",
            content: "Hi! 👋 I'm **Jasmin**, the HealthChain assistant. I can answer any question about our platform — security, features, pricing, how to get started, and more. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [useAI, setUseAI] = useState(true); // try AI first, fallback to local
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Send message to AI API
    const getAIResponse = useCallback(async (userMessage: string, history: ChatMessage[]): Promise<string> => {
        try {
            const chatHistory = history.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            // Add the new user message
            chatHistory.push({ role: "user", content: userMessage });

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: chatHistory }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.fallback) {
                    // API not configured — switch to local mode
                    setUseAI(false);
                    return findLocalResponse(userMessage);
                }
                throw new Error("API error");
            }

            const data = await res.json();
            return data.response;
        } catch (err) {
            console.error("AI API error, using local fallback:", err);
            setUseAI(false);
            return findLocalResponse(userMessage);
        }
    }, []);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        const currentInput = input.trim();
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        let responseText: string;

        if (useAI) {
            // Try AI-powered response
            responseText = await getAIResponse(currentInput, messages);
        } else {
            // Local fallback with simulated delay
            await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 600));
            responseText = findLocalResponse(currentInput);
        }

        const botResponse: ChatMessage = {
            role: "bot",
            content: responseText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
    }, [input, isTyping, useAI, messages, getAIResponse]);

    const handleQuickQuestion = useCallback(async (question: string) => {
        if (isTyping) return;

        const userMessage: ChatMessage = { role: "user", content: question, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        let responseText: string;
        if (useAI) {
            responseText = await getAIResponse(question, messages);
        } else {
            await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 600));
            responseText = findLocalResponse(question);
        }

        setMessages((prev) => [...prev, { role: "bot", content: responseText, timestamp: new Date() }]);
        setIsTyping(false);
    }, [isTyping, useAI, messages, getAIResponse]);

    const handleReset = () => {
        setMessages([{
            role: "bot",
            content: "Hi! 👋 I'm the HealthChain AI assistant. How can I help you today?",
            timestamp: new Date(),
        }]);
        setUseAI(true);
    };

    const quickQuestions = [
        "What is HealthChain?",
        "Is it free?",
        "How secure is my data?",
        "How do I sign up?",
    ];

    // Render markdown-style bold text and line breaks
    const renderMessage = (content: string) => {
        return content.split("\n").map((line, j) => (
            <span key={j}>
                {line.split(/(\*\*.*?\*\*)/g).map((part, k) =>
                    part.startsWith("**") && part.endsWith("**")
                        ? <strong key={k} className="font-semibold">{part.slice(2, -2)}</strong>
                        : <span key={k}>{part}</span>
                )}
                {j < content.split("\n").length - 1 && <br />}
            </span>
        ));
    };

    return (
        <div className="chatbot-widget">
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform group"
                        aria-label="Open chat"
                    >
                        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
                        <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100vh-6rem))] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Image src="/logo.svg" alt="HealthChain" width={24} height={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Jasmin</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-blue-200 font-medium">
                                            {useAI ? "AI-Powered" : "Online"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleReset}
                                    className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                    title="Reset conversation"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"}`}>
                                            {msg.role === "bot" ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-md"
                                            : "bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-sm"
                                            }`}>
                                            {renderMessage(msg.content)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-end gap-2"
                                >
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length <= 2 && !isTyping && (
                            <div className="px-4 py-2 border-t border-gray-100 bg-white flex-shrink-0">
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Quick Questions</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickQuestions.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleQuickQuestion(q)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium border border-blue-100"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask me anything about HealthChain..."
                                    disabled={isTyping}
                                    className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white border border-transparent focus:border-blue-200 transition-all disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                                Powered by HealthChain{useAI ? " AI" : ""} • <span className="text-gray-500">Not medical advice</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
