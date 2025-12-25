"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Wallet, UploadCloud, QrCode, ShieldCheck } from "lucide-react";

const steps = [
    {
        title: "Connect Wallet",
        description: "Sign in securely with MetaMask or WalletConnect. Your wallet is your identity - no passwords to forget.",
        icon: <Wallet className="w-6 h-6 text-blue-400" />,
    },
    {
        title: "Upload History",
        description: "Upload critical medical data (blood type, allergies, conditions) to IPFS. Encrypted by default.",
        icon: <UploadCloud className="w-6 h-6 text-blue-400" />,
    },
    {
        title: "Generate QR",
        description: "Get a unique emergency QR code. Print it for your wallet or save it to your phone lock screen.",
        icon: <QrCode className="w-6 h-6 text-blue-400" />,
    },
    {
        title: "Emergency Access",
        description: "First responders scan to view *only* the life-saving data you authorized. Zero delays.",
        icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
    },
];

export function TimelineSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section id="how-it-works" ref={containerRef} className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                        How <span className="text-blue-500">HealthChain</span> Works
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Zero friction. Maximum security. Ready in 3 steps.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2">
                        <motion.div
                            style={{ height: lineHeight }}
                            className="w-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 shadow-[0_0_10px_#3b82f6]"
                        />
                    </div>

                    <div className="space-y-12">
                        {steps.map((step, index) => (
                            <TimelineItem
                                key={index}
                                step={step}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function TimelineItem({ step, index }: { step: any, index: number }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex items-center md:justify-between gap-8 ${isEven ? "" : "md:flex-row-reverse"}`}
        >
            {/* Start Node (Mobile: Left, Desktop: Center) */}
            <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 z-10">
                <div className="w-10 h-10 rounded-full bg-black border-4 border-blue-900 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Content Card */}
            <div className={`flex-1 pl-16 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-colors group">
                    <div className={`flex items-center gap-4 mb-3 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                        <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                    </p>
                </div>
            </div>

            {/* Empty Spacer for alternating layout */}
            <div className="hidden md:block flex-1" />
        </motion.div>
    );
}
